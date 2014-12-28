"use strict";

// The hashing difficulty.
// 2 ^ difficulty rounds of SHA-256 will be computed.
var difficulty = 16;

$(function() {
  // Get the current tab.
  chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      // Make sure we got the tab.
      if (tabs.length !== 1) {
        $('#controls').addClass('hidden');
        $('#error').removeClass('hidden').text('Unable to determine active tab.');
        return;
      }

      // Get the hostname.
      var hostname = null;
      var matches = tabs[0].url.match(/^http(?:s?):\/\/([^/]*)/);
      if (matches) {
        hostname = matches[1];
      } else {
        // Example cause: files served over the file:// protocol.
        $('#controls').addClass('hidden');
        $('#error').removeClass('hidden').text('Unable to determine hostname.');
        return;
      }
      if (/^http(?:s?):\/\/chrome\.google\.com\/webstore.*/.test(tabs[0].url)) {
        // Technical reason: Chrome prevents content scripts from running in the app gallery.
        $('#controls').addClass('hidden');
        $('#error').removeClass('hidden').text('Hashpass cannot run in the Chrome Web Store.');
        return;
      }
      $('#hostname').text(hostname);

      // Run the content script to register the message handler.
      chrome.tabs.executeScript(tabs[0].id, {
        file: 'content_script.js'
      }, function() {
        // Check if a password field is selected.
        chrome.tabs.sendMessage(tabs[0].id, {
            type: 'check'
          }, function(response) {
            // Different user interfaces depending on whether a password field is in focus.
            var passwordMode = (response.type === 'password');
            if (passwordMode) {
              $('.password-mode-off').addClass('hidden');
              $('.password-mode-on').removeClass('hidden');
            } else {
              $('.password-mode-off').removeClass('hidden');
              $('.password-mode-on').addClass('hidden');
            }

            // Called whenever the key changes.
            var update = function() {
              // Compute the first 16 base64 characters of iterated-SHA-256(hostname + '/' + key, 2 ^ difficulty).
              var key = $('#key').val();

              var rounds = Math.pow(2, difficulty);
              var bits = hostname + '/' + key;
              for (var i = 0; i < rounds; i += 1) {
                bits = sjcl.hash.sha256.hash(bits);
              }

              var hash = sjcl.codec.base64.fromBits(bits).slice(0, 16);
              $('#hash').val(hash);
              return hash;
            };

            // A debounced version of update().
            var timeout = null;
            var debouncedUpdate = function() {
              if (timeout !== null) {
                clearInterval(timeout);
              }
              timeout = setTimeout((function() {
                update();
                timeout = null;
              }), 100);
            }

            if (passwordMode) {
              // Listen for the Enter key.
              $('#key').keydown(function(e) {
                if (e.which === 13) {
                  // Try to fill the selected password field with the hash.
                  chrome.tabs.sendMessage(tabs[0].id, {
                      type: 'fill',
                      hash: update()
                    }, function(response) {
                      // If successful, close the popup.
                      if (response.type === 'close') {
                        window.close();
                      }
                    }
                  );
                }
              });
            }

            if (!passwordMode) {
              // Register the update handler.
              $('#key').bind('propertychange change click keyup input paste', debouncedUpdate);
            }

            // Update the hash right away.
            debouncedUpdate();

            // Focus the text field.
            $('#key').focus();
          }
        );
      });
    }
  );
});
