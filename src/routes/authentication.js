const express = require('express');
const router = express.Router();

// // SIGNUP
// router.get('/signup', isNotLoggedIn, (req, res) => {
// 	res.render('auth/signup', { layout: 'login', title: 'Registro' });
// });

// router.post(
// 	'/signup',
// 	passport.authenticate('local.signup', {
// 		successRedirect: '/logout',
// 		failureRedirect: '/signup'
// 	})
// );

// router.get('/logout', isLoggedIn, (req, res) => {
// 	req.logOut();
// 	res.redirect('/signin');
// });

// // SINGIN
// router.get('/signin', isNotLoggedIn, (req, res) => {
// 	res.render('auth/signin', { layout: 'login', title: 'Iniciar sesión' });
// });

// router.post('/signin', (req, res, next) => {
// 	passport.authenticate('local.signin', {
// 		successRedirect: '/products/list',
// 		failureRedirect: '/signin'
// 	})(req, res, next);
// });

// router.get('/logout', (req, res) => {
// 	req.logOut();
// 	res.redirect('/');
// });

module.exports = router;
