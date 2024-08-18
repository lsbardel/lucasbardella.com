title: My dev environment on Windows WSL2
author: Luca Sbardella
date: 2024-08-18 18:00:00
slug: my-wsl2-dev-environment
description: How I set up my development environment on Windows WSL2 for working with rust, python, node js and other tools
image: {{ assetUrl }}/blog/github.jpg
head-tag: wls2, dev, rust, python, documentation
category: dev

---


Coming from a Mac environment, I was used to having a Unix-like shell and a package manager that made it easy to install and manage software. I tried using the Windows Subsystem for Linux (WSL), and everything changed. I no longer need to pay the Apple tax to have a Unix-like environment. I can use Windows for both fun and work.


## Setup WSL v2

WSL stands for Windows Subsystem for Linux. It's a compatibility layer that enables you to run Linux environments directly on Windows. This means you can use Linux tools, utilities, and applications seamlessly on your Windows system without the need for a virtual machine.

* Install the `Windows Terminal` from the Microsoft Store - this allows you to have multiple tabs with different shells
* make sure WSL v2 is set up correctly - on a Windows shell type `wsl --status` and check that the default version is 2.
* Create a disk partition where to install a Linux distribution for WSL2 - I mounted the partition in the `D` drive
* Install a Linux distribution from the Microsoft Store - I use Ubuntu 24.04 LTS - Install it in the dedicated disk partition if you can
* If you cannot install to the dedicated partition, you can export the distribution and import it in the new location
  * `wsl --export Ubuntu-24.04 D:\ubuntu24_backup.tar`
  * `wsl --import Ubuntu-24.04-2 D:\WSL\Ubuntu-24.04 D:\ubuntu24_backup.tar`
* Set the distribution as your default - `wsl --set-default Ubuntu-24.04-2`
* Create a new user
  * `sudo adduser luca`
  * `sudo usermod -aG sudo luca`
  * vim `/etc/wsl.conf` `and add the following lines to set the default user
    ```
    [user]
    default=your_username
    ```
* restart WSL2 `wsl --shutdown`

## Setup the Linux environment

* Update the system `sudo apt update && sudo apt upgrade`
* Install the tools, this is what is needed for pyenv (see below), [protobuf](https://github.com/protocolbuffers/protobuf) and other tools I use
  ```bash
  sudo apt install \
    keychain \
    build-essential \
    protobuf-compiler \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    curl \
    git \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev \
    just
  ```

## Setup the shell

My `.bash_aliases` file
```bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PYENV_ROOT/shims:$PATH"
alias py="pyenv exec python"
# For Loading the SSH key
export HOST=luca-dell
keychain -q --nogui ${HOME}/.ssh/id_ed25519
source ${HOME}/.keychain/${HOST}-sh
```

Allows to use `py` to run the python version managed by `pyenv` and to load the SSH key when I open a new shell.

Setup git config
```bash
git config --global user.name Luca Sbardella
git config --global user.username lsbardel
git config --global user.email luca@quantmind.com
git config --global core.editor vim
```

and check it with `git config --list`

## Setup the development tools

I use Rust, Python, and Node.js for my development work. Here is how I set up the tools.

### Rust

* Simply [Install rust](https://www.rust-lang.org/tools/install)
* Update to the latest version (do this anytime you want to update the compiler)
  ```bash
  rustup update stable
  ```

### Python

* clone [pyenv](https://github.com/pyenv/pyenv) in the `~/.pyenv` directory
* install the python versions you need, for example
  ```bash
  pyenv install 3.12.5
  ```


### Node

* Install node and npm via
  ```bash
  sudo apt install nodejs npm
  ```
* Install yarn globally
  ```bash
  sudo npm install -g yarn
  ```
