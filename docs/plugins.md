---
layout: default
title: giuseppe - plugins
---
# Plugins

Giuseppe is now pluggable! 🎉

This means, if someone wants to add a feature, we don't need to create a new release of giuseppe, we just can
release a plugin for giuseppe. The core features of giuseppe are designed as a plugin themselfes.

## Create a plugin

To create a plugin, we suggest you use the [yeoman generator](http://giuseppe-plugin-generator.smartive.ch/) to bootstrap your plugin project.
If you want to do that by yourself, install giuseppe as a dependency and start coding.

You'll need [GiuseppePlugin](/api/interfaces/giuseppeplugin.html) for that.
A good example would be [the core plugin](/api/classes/giuseppecoreplugin.html).

Implement everything you want (like custom controllers, custom routes, etc.) and give your plugin a unique name.

Have a look at our [version](https://github.com/smartive/giuseppe-version-plugin) and 
[reqres](https://github.com/smartive/giuseppe-reqres-plugin) plugin aswell.

**Note**: If you forget to actually register the components into a plugin, giuseppe will throw an error.

## Use a plugin

To use a plugin someone wrote, just `npm install` them into your project and pass them to giuseppe before you
fire up giuseppe.

```typescript
import { Giuseppe } from 'giuseppe';
import { MyFancyGiuseppePlugin } from 'myfancygiuseppeplugin';

const giusi = new Giuseppe();

giusi.registerPlugin(new MyFancyGiuseppePlugin());

giusi
    .loadControllers('./controllers/**/*.js')
    .then(() => giusi.start());
```
