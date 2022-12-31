const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')



function authController() {
    return {
        login(req, res) {
            res.render("auth/login")
        },
        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {

                const { email, password } = req.body

                // validate user
                if ( !email ||  !password ) {
                    req.flash('error', 'All fields are required!!')

                    return res.redirect('/login')
                }

                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('./login')
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })

            })(req, res, next)
        },
        register(req, res) {
            res.render("auth/register")
        },
        async postRegister(req, res) {
            const { name, email, phone, password, confirmPassword } = req.body

            // validate user
            if (!name || !email || !phone || !password || !confirmPassword) {
                req.flash('error', 'All fields are required!!')
                req.flash('name', name)
                req.flash('email', email)
                req.flash('phone', phone)

                return res.redirect('/register')
            }
            if (password !== confirmPassword) {
                req.flash('error', 'Passwords are not matched!!')
                req.flash('name', name)
                req.flash('email', email)
                req.flash('phone', phone)

                return res.redirect('/register')
            }

            // check if email exist in the database
            User.exists({ email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email', email)
                    req.flash('phone', phone)

                    return res.redirect('/register')
                }
            })


            // hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            // create user
            const user = new User({
                name,
                email,
                phone,
                password: hashedPassword

            })

            user.save().then((user) => {
                console.log(user)
                // login 

                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong')

                return res.redirect('/register')

            })



        },
        logout(req, res) {
            req.logout(function (err) {
                if (err) {
                    return next(err)
                }
                res.redirect('/login');
            })
            // req.logout()
            // return res.redirect('/login')
        }
    }
}

module.exports = authController