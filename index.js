'use strict';

const passport = require('koa-passport');
const passportLocal = require('passport-local');
/**
 * Strapi passport hook
 */

module.exports = function (strapi) {
	const hook = {
		/**
		 * Default options
		 */
		defaults: {
		},
    /**
     * Initialize the hook
     */
		initialize: function (cb) {
			console.log('strapi-auth init called');
			strapi.after(["hook:generic-session:loaded"], () => {

				console.log('strapi-local-auth initialized');


				strapi.app.use(passport.initialize());
				strapi.app.use(passport.session());

				var user = {id: 1, username: 'test'};

				passport.serializeUser(function (user, done) {
					done(null, user.id);
				});

				passport.deserializeUser(function (id, done) {
					done(null, user);
				});

				var LocalStrategy = passportLocal.Strategy;
				passport.use(new LocalStrategy(function (username, password, done) {
					// retrieve user ...
					if (username === 'test' && password === 'test') {
						done(null, user);
					} else {
						done(null, false);
					}
				}));

				// Make this passport instance globally available
				//strapi.passport = passport;
				console.log('local auth strategy chosen');
				cb();
			});
		}
	};
	return hook;
};

			/* passport.serializeUser(function(user, done) {
				strapi.log.info("serialize User called", user);
			  done(null, user.id)
			})

			passport.deserializeUser(function(id, done) {
				console.log(id)
				strapi.log.info("deserializeUser called");
				strapi.services.userlogin.fetch({id: id})
				.then(function(user) {
					if (user !== false) {
						done(null, {id: user.attributes.id , username: user.attributes.username});
					} else {
						done(null, false, {message: "Couldn't retrieve user"});
					}
				})
				.catch(function(err) {
					strapi.log.info("Deserialize error");
					done(null, false, { message: err});
				});
			});

			var LocalStrategy = passportLocal.Strategy;
			passport.use(new LocalStrategy((username, password, done) => {
				strapi.log.info("executing local strategy");

				// Retrieve user
				strapi.services.userlogin.getUser(username, password)
				.then(function(user) {
					// console.log("resolved to", user);
					done(null, {id: user.attributes.id , username: user.attributes.username, role: user.attributes.role});
				})
				.catch(function(err) {
					strapi.log.info("Login Error", err);
					done(null, false);
				});
			}));*/
