const nodemailer = require('nodemailer')
const pug = require('pug')
//inlines css
const juice = require('juice')
const htmlToText = require('html-to-text')
const promisify = require('es6-promisify')

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

//TRY IT OUT
// transport.sendMail({
//   from: 'Katy Cassidy <ihatetoast@gmail.com>',
//   to: 'fab@dog.com',
//   subject: 'Feed me!',
//   html: 'I am <strong>hungry</strong>, woman!',
//   text: 'I am ***hungry***, woman!'
// })

//NOT EXPORTED because only used here
const generateHTML = (filename, options = {}) => {
  //__dirname anchors this so wherever the file really is, the rel path starts from this file
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options)
  // console.log(html)

  //the styling is lost when email goes out, so this will take the stile from css files and make them inline
  const inlined = juice(html)
  return inlined
}

exports.send = async (options = {}) =>{
  const html = generateHTML(options.filename, options)
  const text = htmlToText.fromString(html)

  const mailOptions = {
    from: `Katy Cassidy noreply@ihatetoast.com`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  }
  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions)
}
