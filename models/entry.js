const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name is too short!'],
    required: true,
  },
  number: {
    type: String,
    minLength: [8, 'Number is too short!'],
    validate: {
      validator(v) {
        return /^[0-9]{2,3}-[0-9]+$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: true,
  },
})

entrySchema.set('toJSON', {
  /* eslint-disable no-param-reassign, no-underscore-dangle */ //
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
  /* eslint-enable no-param-reassign, no-underscore-dangle */ //
})

module.exports = mongoose.model('Entry', entrySchema)
