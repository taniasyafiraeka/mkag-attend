const {OfficialURL}=require("../globalData");

module.exports.Welcome = (firstName) => {
  return `
        <p>Hi ${firstName}, </p>
        <p>Thank you for signing up Attendlytical! Do send me an email to:
        <a href="mailto:attendlytical@gmail.com">attendlytical@gmail.com</a></p>
        if you have any inquiry, suggestion or found bug.<p>Thank you again and have a nice day ahead!</p>
        <i>Note: This mail is auto-generated for every signup</i>
        <p>
        Thanks, <br/>
        Attendlytical
        </p>
    `;
};


module.exports.KickMember = (firstName, payload) => {
  return `
        <p>Hi ${firstName}, </p>
        <p>
          Event owner had kicked you out from the event below. 
        </p>
        
        <p>---------------------Event Detail---------------------</p>
        <p>Event ID: <strong>${payload.event.shortID}</strong> </p>
        <p>Event Owner: <strong>${payload.owner.firstName} ${payload.owner.lastName}</strong></p>
        <p>Event Code: <strong>${payload.event.code}</strong> </p>
        <p>Event Name: <strong>${payload.event.name}</strong> </p>
        <p>Event Session: <strong>${payload.event.session}</strong> </p>
        
        Click <a href=${OfficialURL}>here</a> to sign in
        <p>
        Thanks, <br/>
        Attendlytical
        </p>
    `;
};

module.exports.DeleteEvent = (firstName, payload) => {
  return `
        <p>Hi ${firstName}, </p>
        <p>
          Event owner had deleted the event below, hence disappeared in your enrolled event list. Sayonara.
        </p>
      
        <p>---------------------Event Detail---------------------</p>
        <p>Event ID: <strong>${payload.event.shortID}</strong> </p>
        <p>Event Owner: <strong>${payload.owner.firstName} ${payload.owner.lastName}</strong></p>
        <p>Event Code: <strong>${payload.event.code}</strong> </p>
        <p>Event Name: <strong>${payload.event.name}</strong> </p>
        <p>Event Session: <strong>${payload.event.session}</strong> </p>
      
        Click <a href=${OfficialURL}>here</a> to sign in
        <p>
        Thanks, <br/>
        Attendlytical
        </p>
    `;
};

module.exports.WithdrawEvent = (firstName, payload) => {
  return `
    <p>Hi ${firstName}, </p>

    <p>
      A member had withdrawn from your event below. 
    </p>
    
    <p>---------------------Member Detail---------------------</p>
    <p>First Name: <strong>${payload.member.firstName}</strong></p>
    <p>Last Name: <strong>${payload.member.lastName}</strong> </p>
    <p>Matric No: <strong>${payload.member.cardID}</strong> </p>
    <p>Email: <strong>${payload.member.email}</strong> </p>
    <br />
    <p>---------------------Enrolled Event Detail---------------------</p>
    <p>Event ID: <strong>${payload.event.shortID}</strong> </p>
    <p>Event Owner: <strong>You</strong></p>
    <p>Event Code: <strong>${payload.event.code}</strong> </p>
    <p>Event Name: <strong>${payload.event.name}</strong> </p>
    <p>Event Session: <strong>${payload.event.session}</strong> </p>

    Click <a href=${OfficialURL}>here</a> to sign in
    <p>
    Thanks, <br/>
    Attendlytical
    </p>
      `;
};

module.exports.CreateAttendance = (firstName, payload) => {
  return `
        <p>Hi ${firstName}, </p>
        <p>
          You have a new attendance. 
        </p>
        
        <p>---------------------Event Detail---------------------</p>
        <p>Event ID: <strong>${payload.event.shortID}</strong> </p>
        <p>Event Owner: <strong>${payload.owner.firstName} ${payload.owner.lastName}</strong></p>
        <p>Event Code: <strong>${payload.event.code}</strong> </p>
        <p>Event Name: <strong>${payload.event.name}</strong> </p>
        <p>Event Session: <strong>${payload.event.session}</strong> </p>
        

        <h3>Attendance Room ID: ${payload.event.attendanceID}</h3>

        Enter room here: <a href=${payload.event.attendanceURL}>here</a>
        Click <a href=${OfficialURL}>here</a> to sign in
        <p>
        Thanks, <br/>
        Attendlytical
        </p>
    `;
};
