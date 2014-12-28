# Hashpass

[Hashpass](https://chrome.google.com/webstore/detail/hashpass/gkmegkoiplibopkmieofaaeloldidnko) is a simple Chrome extension designed to make passwords less painful. Specifically, it provides a quick way to compute the first 16 [Base64](http://en.wikipedia.org/wiki/Base64) characters of the iterated [SHA-256 hash](http://en.wikipedia.org/wiki/SHA-2) of `current_domain/secret_key`. The number of rounds is set to `2^16`.

For example, suppose you want to create a password for `mail.google.com`. Imagine some secret key, say, `bananas`. Hashpass would compute the hash of `mail.google.com/bananas` and output the first 96 bits in Base64: `PFmEp+Uy0mv59Riq`.

Now suppose you want a password for `www.facebook.com`. You don't need to memorize another secret key—just use `bananas` again. Hashpass outputs `lq4wCR1FcrOteiHr`.

In general, it is very bad to reuse passwords. Hashpass generates a different password for every service you use, so your password for one service cannot be used to gain access to any of your accounts on other services.

A key feature of Hashpass is that it's stateless. Hashpass never writes to the file system or makes network requests. There is no password database.

**NOTE:** If an attacker can guess your master password, they gain access to all your accounts. Be sure to pick a password with enough entropy that it is not vulnerable to rainbow tables / dictionary attacks.

## Installation

Install Hashpass from the Chrome App Store ([link](https://chrome.google.com/webstore/detail/hashpass/gkmegkoiplibopkmieofaaeloldidnko)). You will then see the Hashpass button next to your address bar.

## How it works

Click the Hashpass button next to the address bar, and this will pop up:

![Screenshot](https://raw.githubusercontent.com/boyers/hashpass/master/screenshot1.png)

As you type, a hash is computed based on what you enter and the current domain. Most often, you will want to select a password field first. Then Hashpass doesn't show the computed hash:

![Screenshot](https://raw.githubusercontent.com/boyers/hashpass/master/screenshot2.png)

## Notes

- Hashpass doesn't store passwords. It simply computes a cryptographic hash every time you use it. If your computer is compromised, Hashpass leaves nothing to be stolen.

- If you find yourself using a computer that does not have Hashpass, you can just compute the hash yourself using your favorite programming language. For example, in Python, you would use:

    ```
    import hashlib
    import base64
    bits = 'domain/key'
    for i in range(2 ** 16):
      bits = hashlib.sha256(bits).digest()
    base64.b64encode(bits)[:16]
    ```

- If a generated password is ever compromised, you don't need to memorize a whole new master key. Just add an incrementing index to your secret key. For example, if your key was `bananas`, just use `bananas2`. If you can't remember which iteration of your secret key you used for a particular service, simply try them all in order.

- Some websites have certain requirements on passwords, e.g., at least one number and one capital letter. A simple way to meet such requirements is to append something like `A9!` to the generated password (and remember that you did that).

- Of course you don't have to use the same key for every service. But the point of Hashpass is that you can. Make sure your key has [high entropy](http://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength)!

- As with any good security software, Hashpass is open-source ([Github](https://github.com/boyers/hashpass)). It uses the [Stanford Javascript Crypto Library](http://bitwiseshiftleft.github.io/sjcl/) to compute SHA-256.

## License

Copyright (c) 2014 Stephan Boyer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
