# akash

The Angularjs-based GUI for ChrisBoesch.com.


## Setup

Fork https://github.com/ChrisBoesch/akash and clone it:
```
git clone git@github.com:your-gihub-user-name/akash.git
cd akash
git remote add upstream git@github.com:SingaporeClouds/akash.git
```

Then install dependencies:
```
npm install -g grunt-cli
npm install
```


## Development

To run the development server:
```
grunt dev
```

To run the unit tests automaticaly:
```
grunt autotest
```

To run the e2e tests and update the screenshots:
```
grunt autotest:e2e
```


## Project layout

Features assets, including tests, html partials and css rules, are grouped
together inside subsection or component folders.

For example `app/userdetails` is a subscetion regrouping angular modules,
tests, a css style style sheet and two html partials for the users' profile
page (and the form to update its settings).

`app/components/users` is a components used by many akash modules to request
edit or validate users' info.

```
|-.bowerrc
|-.gitignore
|-.jshintrc              JS Hint config.
|-.travis.yml            Travis config.
|-Gruntfile.js           Task to build akash, run its test and run the dev server.
|-LICENSE
|-README.md
|-app/                   Akash GUI for OEP.
|---app-config.js          Akash angularjs app config.
|---app-fixtures.js        Fixtures for e2e tests and dev servers.
|---app-mock.js            Mock OEP, Code School and Treehouse API responses.
|---app-services.js        Very few services should be defines here.
|---app-templates.js       A dummy empty modules. Is replaced during the build process
                         by cached html partials.
|---app.css                Styles for elements defined in index.html
|---app.js                 Akash Angularjs app
|---index.html
|---admin/               Admin subsection.
|---components/          Akash components.
|-----card/              Services and directives about report cards.
|-----debounce/          A debounce service.
|-----user/              Services and directives about OEP users.
|-----utils/             Miscellinous utility fountions (debounce should be moved there).
|---lib/                 Dependencies.
|---navbar/              Navbar subsection.
|---ranks/               Ranks subsection.
|---suggestions/         Suggestions subsection (contact form).
|---userdetails/         User details (setting form and profile page).
|-config/                Test config files.
|-screenshots/           Akash screenshot
```
