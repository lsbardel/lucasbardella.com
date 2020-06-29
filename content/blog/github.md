title: Hosting your Sphinx docs in Github
date: 2010-02-09 09:52:19
author: Luca Sbardella
slug: hosting-your-sphinx-docs-in-github
description: How to set up Sphinx and Github to create great documentation for your project on Github servers
image: ${assetUrl}/blog/github.jpg
head-tag: github, python, documentation
category: git

---

[Github](http://github.com/) is a social source control service which has been growing at an incredible pace over the last year or so. I use it for most of my own and my company source control. If you don't know about it, check it out.
[Sphinx](http://sphinx.pocoo.org/) is a tool that makes it easy to create intelligent and beautiful documentation.

I assume you are familiar with both Github and Sphinx, albeit not an expert. In this brief post I assume your project is called `myproject` and it is already hosted at `http://github.com/username/myproject`.

Once successful, your project documentation will be publicly available (even for a private repo) at `http://username.github.com/myproject`.

## Creating the documentation branch

Github allows each project to have its [custom web pages](http://pages.github.com/) by creating a new branch in the repository called **gh-pages**.
To create the new branch which works nicely with Sphinx I first create a directory which will hold the Sphinx builds, lets call it `/path/to/myprojectdocs/`. Move into the directory and clone your repository using

```bash
git clone git@github.com:username/myproject.git html
```

Move into the `/path/to/myprojectdocs/html` directory and fire the following commands on the shell

```bash
git symbolic-ref HEAD refs/heads/gh-pages
rm .git/index
git clean -fdx
```

After this your directory will contain nothing, but don't worry, your repo is still in Github.

## Sphinx configuration

I assume you already have a Sphinx documentation directory for your project called `/path/to/myproject/docs/`. Move into this directory, edit the file `Makefile` and change the entry

```
BUILDDIR = /path/to/myprojectdocs
```

There is one last thing to do before we can compile our docs and push them to our github repository. For some reasons, Sphinx save static files into a directory names `_static` and you can't change that. On the other hand, github processes the incoming html with [Jekyll](http://github.com/mojombo/jekyll) which believes top level folders starting with an underscore are special and does not let their content be accessible to the server.

Fortunately, a [phinx-to-github](http://github.com/michaeljones/sphinx-to-github) extension is available to solve the problem. All you need to do is to download the `sphinxtogithub.py` script and put it in your `PYTHONPATH` or Sphinx extension path and add

```python
extensions = [ "sphinxtogithub" ]
```

to your `conf.py` file. Save and run `make html`.

Now go back to `/path/to/myprojectdocs/html` and you should see all the files of your documentation. Add them to git and

```bash
git commit -a -m "First commit of docs"
git push origin gh-pages
```

All done.
