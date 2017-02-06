import {Controller, Get, registerControllers} from '../../index';
import express = require('express');

import passport = require('passport');

let BasicStrategy = require('passport-http').BasicStrategy;

let app = express();
app.use(require('body-parser').json());
app.use(passport.initialize());

passport.use(new BasicStrategy((user, pass, done) => {
    if (user === 'demo' && pass === 'demo') {
        return done(null, {user});
    }
    return done(null, false);
}));

@Controller('secure', passport.authenticate('basic', {session: false}))
class DemoController {
    @Get()
    public tryAuth(): string {
        return 'Hello from the authenticated site!';
    }
}

app.use(registerControllers('/api'));

app.listen(8080, () => {
    console.log('Up and running on port 8080');
});
