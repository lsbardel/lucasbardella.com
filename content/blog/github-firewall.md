date: 2010-08-10 10:51:08
title: Github behind a draconian firewall
slug: github-behind-a-draconian-firewall
author: Luca Sbardella
description: Sometimes there is a need to work with sub-optimal technologies such as a windows operative system behind a ssh-blocking draconian firewall. How worse can it get?
image: https://farm3.staticflickr.com/2548/4110823060_227b76fccd_z_d.jpg
head-tag: github, firewall
category: git

---

Sometimes there is a need to work with sub-optimal technologies such as a windows operative system behind a ssh-blocking draconian firewall. How worse can it get?
I had this problem while working at a client office and fortunately there is a way to handle the situation as discussed in this [thread at github](http://github.com/blog/642-smart-http-support).

In short the best way is to use git smart HTTP support.
Starting with a working installation of [cygwin](http://www.cygwin.com/) with git, I first set the proxy

    git config --global http.proxy "your.proxyserver.com"

This should be enough to pull read-only repository via http. However if you try to pull read/write repos via https git prompts for a password but doesn't accept the input for some bizarre reason.

To solve the problem clone the repo using the url:

    https://username:password@github.com/user/repo

Then switch off SSL verification

    git config --global http.sslverify false
