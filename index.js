'use strict'

const passport = require('koa-passport')
const passportLocal = require('passport-local')
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
      //console.log('strapi-auth init called')
      strapi.after(['hook:generic-session:loaded'], () => {
        strapi.log.info('strapi-local-auth initialized')

        strapi.app.use(passport.initialize())
        strapi.app.use(passport.session())

        passport.serializeUser(function (user, done) {
          strapi.log.info('serialize User called', user)
          done(null, user)
        })

        passport.deserializeUser(function (userSession, done) {
          strapi.services.jsonapi.fetch(strapi.models.user, {id: userSession.id}, { include:['userlogins'] })
            .then(function (user) {
              if (user !== false && user !== null) {
                done(null, user)
              } else {
                done(null, false, {message: "Couldn't retrieve user"})
              }
            })
            .catch(function (err) {
              strapi.log.info('Deserialize error')
              strapi.log.info(err)
              done(null, false, { message: err })
            })
        })

        var LocalStrategy = passportLocal.Strategy
        passport.use(new LocalStrategy({
          usernameField: 'email'
        },
        (username, password, done) => {
          // Retrieve user
          strapi.services.userlogin.getUser(username, password)
            .then(function (userlogin) {
              userlogin = userlogin.toJSON() || userlogin
              done(null, {
                id: userlogin.user.id,
                email: userlogin.email,
                role: userlogin.user.role,
                status: userlogin.user.status,
                isBuyer: userlogin.user.isBuyer,
                isSeller: userlogin.user.isSeller,
                isBlocked: userlogin.user.isBlocked,
                isValidated: userlogin.user.isValidated,
                mandateReference: userlogin.user.mandateReference
              })
            })
            .catch(function (err) {
              strapi.log.info('Login Error', err)
              done(null, false)
            })
        }))

        cb()
      })
    }
  }
  return hook
}
