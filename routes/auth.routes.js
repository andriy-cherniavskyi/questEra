const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const config = require('config')
const router = Router()

router.post(
  '/register', 
  [
    check('email', 'Incorrect email').isEmail(),
    check('password', 'Incorrect password. Password should contain at least 6 characters')
    .isLength({min: 6}),
    check('username', 'Enter you First name and Last name').exists()
  ],
  async (req, res) => {
    console.log(req.body);

  try {
    
    const errors = validationResult(req)

    if(!errors.isEmpty) {
      res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect information during registration'
      })
    }

    const {email, password, username} = req.body

    const candidate = await User.findOne({email})

    if (candidate) {
      return res.status(400).json({message: 'User with this email is already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({email: email.toLowerCase(), password: hashedPassword, username, isAdmin: false})

    await user.save()

    res.status(201).json({message: `Пользователь "${username}" успешно создан`})

  } catch (e) {
    res.status(500).json({ message: `Something went wrong, please try again. Error: ${e}` })
  }
})

router.post('/login', 

  [
    check('email', 'Incorrect email or password').normalizeEmail().isEmail(),
    check('password', 'Incorrect email or password').exists()
  ],

  async (req, res) => {
    try {

      const errors = validationResult(req)

      if(!errors.isEmpty) {
        res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect information during login'
        })
      }

      const {email, password} = req.body
      const user = await User.findOne({email: email.toLowerCase()})

      if (!user) {
        return res.status(400).json({message: 'User is not registered'})
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({message: 'Incorrect password'})
      }

      const token = await jwt.sign(
        {userId: user.id}, 
        config.get('secretKey'), 
        {expiresIn: '1h'}
      )

      res.json({ token, userId: user.id })
      
    } catch(e) {
      res.status(400).json({message: 'Something went wrong during login, please try again'})
    }
})

router.post('/admin/login', 

  [
    check('email', 'Incorrect email or password').normalizeEmail().isEmail(),
    check('password', 'Incorrect email or password').exists()
  ],

  async (req, res) => {
    try {

      const errors = validationResult(req)

      if(!errors.isEmpty) {
        res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect information during login'
        })
      }

      const {email, password} = req.body
      const user = await User.findOne({email: email.toLowerCase()})

      if (!user) {
        return res.status(400).json({message: 'User is not registered'})
      }

      if (!user.isAdmin) {
        return res.status(400).json({message: 'You do not have access rights'})
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({message: 'Incorrect password'})
      }

      const token = await jwt.sign(
        {userId: user.id}, 
        config.get('secretKey'), 
        {expiresIn: '1h'}
      )


      res.json({ token, userId: user.id })
      
    } catch(e) {
      res.status(400).json({message: 'Something went wrong during login, please try again'})
    }
})

module.exports = router