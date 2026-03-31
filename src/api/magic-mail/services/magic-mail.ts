/**
 * magic-mail service
 */
import nodemailer from 'nodemailer';
const jwt_decode = require("jwt-decode");
export default () => ({
  magicMail: async (body) => {
    var email = body?.email?.toLowerCase();
    //return email
    
    var username = body?.username;
    const userId = jwt_decode.jwtDecode(body?.jwt_token);
    var role = body?.role;
    const phone = body?.phone;
    const crypto = require("crypto");
    const uid = crypto.randomBytes(16).toString("hex");
    // const user = await strapi.plugins['users-permissions'].services.user.fetch(Number(userId?.id))
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      populate: ['role'],
      where: {         
        id: userId?.id
      }
    });
    const roleId: any = await strapi.query("plugin::users-permissions.role").findOne({
      select: ['id', 'name', 'type'],
      where: {
        name: role
      }
    });

    try {
      if (!user?.role?.name?.includes('superAdmin')) {
        if (user?.role?.name?.includes('Admin') && role?.includes('superAdmin')) {
          return {
            message: 'you are un-authorized to add super admin...'
          }
        } else if(user?.role?.name?.includes('User') && (role?.includes('superAdmin') ||role?.includes('Admin'))){
          return {
            message: 'you are un-authorized to add admins...'
          }
        }
      }
      let entry_cust_user;
      const data: any = {
        blocked: false,
        confirmed: true,
        username: username,
        model_id: 0,
        email: email,
        phone: phone,
        provider: 'local', //provider
        uid: uid,
        role: roleId?.id,
        status: 'invited',
        expiry: 144000
      }
      entry_cust_user = await strapi.plugins['users-permissions'].services.user.add(data);

      ////console.log("body  ", entry_magic_link);
      var id = entry_cust_user?.uid;
      var client_url = process.env.CLIENT_URL + "/magic-link?uid=" + id
      //console.log(client_url,"client_url")
      var mailOptions = {
        from: 'no-reply@truckistan.pk',
        to: email,
        bcc: ["muzammil.ahmed@truckistan.pk",
          "farhan.haider@truckistan.pk"
        ],
        subject: 'Email verification',
        html: `<div style="color:#727979;background-color:#ffffff;font-family:'Inter','Segoe UI','Helvetica','Helvetica Neue','Arial','sans-serif';width:600px;font-weight:400;line-height:20px">

        <table cellpadding="0" cellspacing="0" style="margin:0 auto;padding-top:30px">
    
          <tbody>
    
          <tr>
    
            <td style="padding:0 3rem 3rem 3rem">
    
              <h2 style="font-family:'Inter','Segoe UI','Helvetica','Helvetica Neue','Arial','sans-serif';font-weight:600;font-size:1.7rem;color:#283636">Hello,</h2>
    
    
    
          <p>Welcome! We received a request regarding your account. Please verify your email address to continue.</p>
          
          
          
          <div style="background-color:#000000;padding:.75rem 1rem 1rem .813rem;display:inline-block;border-radius:4px;margin-top:24px;margin-bottom:1rem">
          
            <a href="${client_url}" style="text-decoration:none;color:#0c74df;color:#fafbfb" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://signup-processor.service.newrelic.com/v1/signups/d61277e7-ed22-433f-b206-6aa4d7ef2e58?verification_token%3Dc388cfea94f23069510c8d53&amp;source=gmail&amp;ust=1678797244591000&amp;usg=AOvVaw0cIU3cicTZF-osCpeQUAKR">Verify Email</a>
          
          </div>
          
          
          
          <p style="font-size:12px">*By clicking 'verify email' you're agreeing to Terms of Service and Services Privacy Notice</p>
          
          
          
          <p>
          
            Or you can copy/paste the following URL into your browser:<br>
          
            <span style="font-family:&quot;InputMono&quot;,&quot;Inconsolata&quot;,&quot;Bitstream Vera Sans Mono&quot;,&quot;Menlo&quot;,&quot;Monaco&quot;,&quot;Andale Mono&quot;,&quot;Courier New&quot;,&quot;Courier&quot;,monospace;font-size:.7rem;display:block;margin-top:.5rem"><a href="${client_url}" style="text-decoration:none;padding:.2rem .3rem;background-color:#eeefef;color:#0c74df" target="_blank" data-saferedirecturl="${client_url}">${client_url}</a></span>
          
          </p>
          
          
          
          <p>Thank you!</p>
          
          
          
          <div style="padding-top:1rem">
          
            <p style="margin-top:0;margin-bottom:.3rem">Sincerely,</p>
          
            <p style="margin-top:0;margin-bottom:.3rem">Truckistan - Logistics & Transport Solutions</p>
          
          </div>
          
          
          
                  </td>
          
                </tr>
          
              </tbody></table><div class="yj6qo"></div><div class="adL">
    
      </div></div>`,
        //html: `<h3>Truckistan Technologies</h3><br><br><a href="${client_url}"> ${client_url} </a><br><b>This is the magic link to activate your account. Please click this link to activate.</b>`,
      };
      // mailOptions.subject = 'Nodemailer SMTP transporter';
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: "no-reply@truckistan.pk", // your Gmail account email
          pass: "waqdihzvtsgmsupv", // your Gmail account password
        },
      });

      // try{
      // const sentEmail = await strapi.service("api::send-email.send-email").sendEmail(email, 'Email verification', "Hello");
      // //console.log(sentEmail,"sentEmail")
      // }catch(err){
      //   //console.log(err,"errMail")
      // }

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          //console.log(error, "Error");
          // res.status(error.responseCode).send(error.response);
          return error.response
        } else {
          //console.log('Message sent: ' + info.response);
          // res.status(200).send(info);
          return info.response
        }
      });



      //  let send= 
      //  await strapi.plugin('email').service('email').send({
      //       to: 'abch4999@gmail.com',
      //       from: 'no-reply@truckistan.pk',
      //       subject: 'Hello world',
      //       text: 'Hello world',
      //       html: `<h4>Hello world</h4>`,
      //     });
      //   // ////console.log(send,"send====>")
      //   return send
      return entry_cust_user
    }
    catch (err) {
      //console.log(err,"err");
      return err;
    }
  }
});


// export default () => ({
//   magicMail: async (body) => {
//       ////console.log(body,"sdjfkhdskjfhsdkjfhdksj");
//       try{
//          let send=
//          await strapi.plugin('email').service('email').send({
//               to: 'abch4999@gmail.com',
//               from: 'no-reply@truckistan.pk',
//               subject: 'Hello world',
//               text: 'Hello world',
//               html: `<h4>Hello world</h4>`,
//             });
//           // ////console.log(send,"send====>")
//           return send
//       }
//    catch (err) {
//     ////console.log(err);
//     return err;
//   }
// }
// });