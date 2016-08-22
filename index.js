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

				var user = {id: 1, username: 'Fire'};

				passport.serializeUser(function(user, done) {
					strapi.log.info("serialize User called", user);
					done(null, user.id)
				});


				passport.deserializeUser(function(id, done) {
					strapi.log.info("deserializeUser called");
					strapi.services.jsonapi.fetch(strapi.models.userlogin, {id: id})
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
						done(null, {id: user.relations.user.id , username: user.attributes.username, role: user.attributes.role});
					})
					.catch(function(err) {
						strapi.log.info("Login Error", err);
						done(null, false);
					});
				}));

				console.log('local auth strategy chosen');
				cb();
			});
		}
	};
	return hook;
};
