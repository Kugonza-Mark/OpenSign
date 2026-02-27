import crypto from 'node:crypto';
export default async function loginUser(request) {
  const username = request.params.email;
  const password = request.params.password;

if (username && password) {
  try {
if(username === "anuwasiima@ucu.ac.ug"){
 try {
      // Pass the username and password to logIn function
      const user = await Parse.User.logIn(username, password);
      // console.log('user ', user);
      if (user) {
        const _user = user?.toJSON();
        return {
          ..._user,
        };
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'user not found.');
      }
    } catch (error) {      console.log('Error logging in:', error);
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Invalid username or password.');
    } 
}
else{
   // 1️⃣ Call external authentication API
  const response = await fetch("https://alpha.ucu.ac.ug/alpha-api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usernameOrEmail:username, password })
  });

  if (!response.ok) {
    console.log("External auth failed", response);
    throw new Parse.Error(101, "Invalid login");
  }


    // 2️⃣ Find existing Parse user
    const query = new Parse.Query(Parse.User);
    query.equalTo("username", username);

    let user = await query.first({ useMasterKey: true });

    // 3️⃣ Create user if not exists
    if (!user) {
     throw new Error("User not found. ");
    }

   // 3️⃣ Set new random password
  const tempPassword = crypto.randomBytes(16).toString("hex");
  user.set("password", tempPassword);

  await user.save(null, { useMasterKey: true });

  // 4️⃣ NOW log in normally (this creates session safely)
  const loggedInUser = await Parse.User.logIn(username, tempPassword);

 const _user = loggedInUser?.toJSON();
        return {
          ..._user,
        };
      }
  } catch (err) {
    console.log("err in login user", err);
    throw err;
  }

}else {
    throw new Parse.Error(Parse.Error.PASSWORD_MISSING, 'username/password is missing.');
  }
}
