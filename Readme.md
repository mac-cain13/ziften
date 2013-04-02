# ![Ziften icon](https://raw.github.com/mac-cain13/ziften/master/Icon.png)Ziften
Ziften is a browser extension for [Chrome](http://chrome.google.com/) and [Safari](http://www.apple.com/safari/) that puts even more rocket fuel into the issuetracker [Sifter](https://www.sifterapp.com/). It adds hotkeys, search improvements and more for the best issuetracker for small teams.

## How to install?
### Chrome
1. [Go to Ziften in the Chrome Webstore](https://chrome.google.com/webstore/detail/bnehhdimfhgkabgidahbfpchgnkiicog)
2. Click "+ Add to Chrome"
3. Go to [Sifter](http://www.sifterapp.com/) and enjoy!

### Safari
1. [Download the extension](http://mac-cain13.github.com/ziften/ziften.safariextz)
2. Click on it so Safari will offer to install the extension
3. Go to [Sifter](http://www.sifterapp.com/) and enjoy!

## Features / What does it do?
### Jump to issue
Type # followed by an issuenumber and hit enter to jump to that issue instantly. So #1234 + enter will jump to issue 1234 page instantly.

### Jump to project
Start typing an projectname into the searchfield, Ziften will show an autocomplete list of matching projects. Click a project from the list or select a project with the arrow keys and hit enter to jump to that project. No more pointing and clicking through the dropdown list!

### Other issues links
In the "Issues"-menu an "Others" sections shows up to quickly show all issues that are resolved by other users. (Great for testing issues that your collegues solved!)

### Hotkeys
* Hit **n** to jump to the "New issue"-page, works on any page with the "New issue" link.
* Hit **s** to focus the searchbox, works on any page with the searchbox
* Hit **a** to assign an issue to yourself (me), works on the issue page
* Hit **r** to resolve an issue, works on the issue page
* Hit **c** to close an issue, works on the issue page
* Hit **o** to reopen an issue, works on the issue page

### Mentioning issues with #123
When typing an issuenumber in a comment or issue like `#1234`, Ziften will replace it with `i1234` so Sifter will make a link to issue 1234 in the text. Please note that when you want to type something like 'The #1 position is incorrect...' you'll have to rephrase, as Ziften will create a link to issue 1.

### One click issuenumber selection
If you single-click on an issuenumber Ziften will select the whole number. This works in issuelists and on the issue detail page. Handy for mentioning issues in commit messages or in the chatroom.

### Async issue filtering
By default Sifter reloads the entire page when you filter or sort the issuelist. Ziften makes this process asynchronous, so you'll don't need to scroll back down to check an extra filter option and it also feels somewhat faster.

### Settings
In the Safari or Chrome settings you can look for Extensions > Ziften and toggle all of these features on or off. So if you only like some of the features above don't hesitate to try Ziften and just turn off the features you don't like!

## How do I contribute?
A: [Submit issues and ideas](https://github.com/mac-cain13/ziften/issues)

B: [Submit a pull request](https://help.github.com/articles/using-pull-requests):

1. Fork this repo and create a branch
2. Commit and push your changes to your branch
3. When you're happy send us a pull request!

_**Pro-tip:** Make sure to build upon the latest version of the code and keep pull request as small as possible. This makes your pull request easy to merge._

#### How to install the development version
1. [Download the source from GitHub](https://github.com/mac-cain13/ziften/archive/master.zip)
2. [Load the extension into Chrome](http://developer.chrome.com/extensions/getstarted.html#unpacked) or [load the extension into the Safari extensionbuilder](https://developer.apple.com/library/safari/#documentation/Tools/Conceptual/SafariExtensionGuide/UsingExtensionBuilder/UsingExtensionBuilder.html%23//apple_ref/doc/uid/TP40009977-CH2-SW1)

_Note that you need your own [Safari Developer Program](https://developer.apple.com/devcenter/safari/index.action) certificate to sign the Safari version of the extension._

## License
The code of this project is licensed under the [MIT license](https://raw.github.com/wrep/xdebug-helper-for-safari/master/License)
so you can use it in nearly every project you want to, commercial and non-commercial.

Ziften contains [Keymaster.js](https://github.com/madrobby/keymaster) for hotkey functionality, keymaster is also licensed under the [MIT license](https://raw.github.com/madrobby/keymaster/master/MIT-LICENSE).

The Chrome settings screen is based on the [Chrome UI bootstrap](https://github.com/roykolak/chrome-bootstrap) project and is also licensed under the [MIT license](https://raw.github.com/roykolak/chrome-bootstrap/master/LICENSE).

Icon is from the [Free Set of Hand-Drawn Icons](http://vandelaydesign.com/blog/icon-sets/hand-drawn/) designed by [Damian Watracz](http://watracz.com)