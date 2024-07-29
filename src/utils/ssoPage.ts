export const ssoPage = (redirectUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,800' rel='stylesheet' type='text/css'>
        <title>SkyProton - SSO</title>
        <link rel="icon" type="image/png" href="{{.Public}}/favicon.ico">
        <style>
            @-webkit-keyframes blink { 0% { opacity: 0 } 100% { opacity: 1 } }
            @-moz-keyframes    blink { 0% { opacity: 0 } 100% { opacity: 1 } }
            @keyframes         blink { 0% { opacity: 0 } 100% { opacity: 1 } }
            form { display:none; }
            iframe { display:none; }
            body {
                background-color: #ffffff;
                font-family: "Source Sans Pro", Helvetica, Arial, sans-serif;
                color: #337389;
            }
            #sso {
                text-align: center;
                margin-top: 8%;
            }
            #message {
                margin-top: 45px;
                font-size: 35px;
                font-weight: bold;
                display: none;
            }
            a {
                text-decoration: underline;
                color: #40454F;
            }
            button {
                background-color: #337389;
                color: #ffffff;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                position: absolute;
                left: 45%;
                right: 45%;
            }
            button:hover {
                background-color: #40454F;
            }
            input {
                padding: 10px;
                border: 1px solid #337389;
                border-radius: 5px;
                font-size: 16px;
            }
        </style>
        <script>
            function authDetect() {
                if (!document.cookie.includes('token')) {
                    document.getElementById('login').style.display = 'inherit';
                    document.getElementById('error').style.display = 'none';
                    document.getElementById('auth').style.display = 'none';
                } else {
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('auth').style.display = 'inherit';

                    fetch('/user', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }).then(function(response) {
                        return response.json();
                    }).then(function(data) {
                        document.getElementById('userInfo').innerHTML = '<h3>Welcome, ' + data.email + '</h3>';
                    }).catch(function(err) {
                        document.getElementById('userInfo').innerHTML = '<h3>Failed to fetch user info</h3>';
                    });
                }
            }

            document.addEventListener("DOMContentLoaded", function() {
                document.getElementById('message').style.display = 'none';
                
                authDetect();
                
                document.getElementById('auth').addEventListener("click", function() {
                    document.getElementById('message').style.display = 'inherit';
                    fetch('/user/login/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    }).then(function(response) {
                        return response.json();
                    }).then(function(data) {
                        if (data.message === "Login successful") {
                            document.getElementById('message').style.display = 'none';
                            document.getElementById('login').style.display = 'none';
                            document.getElementById('auth').style.display = 'none';
                            window.location.href = '${redirectUrl}?access_token=' + data.token;
                        } else {
                            document.getElementById('message').style.display = 'none';
                            document.getElementById('login').style.display = 'inherit';
                        }
                    }).catch(function(err) {
                        document.getElementById('message').style.display = 'none';
                        document.getElementById('login').style.display = 'inherit';
                        authDetect();
                    });
                    document.getElementById('auth').style.display = 'none';
                });

                document.getElementById('loginButton').addEventListener("click", function() {
                    document.getElementById('message').style.display = 'inherit';
                    fetch('/user/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: document.getElementById('email').value,
                            password: document.getElementById('password').value
                        })
                    }).then(function(response) {
                        return response.json();
                    }).then(function(data) {
                        if (data.message === "Login successful") {
                            document.getElementById('message').style.display = 'none';
                            document.getElementById('login').style.display = 'none';
                            document.getElementById('auth').style.display = 'inherit';
                            authDetect();
                        } else {
                            document.getElementById('message').style.display = 'none';
                            document.getElementById('login').style.display = 'inherit';
                            document.getElementById('error').style.display = 'inherit';
                        }
                    }).catch(function(err) {
                        document.getElementById('message').style.display = 'none';
                        document.getElementById('error').style.display = 'inherit';
                    });
                });
            });
        </script>
    </head>
    <body id="sso">
        <h1>SkyProton SSO</h1>
        <div id='sso'>
            <div id="userInfo"></div>
            <button id="auth">Auth</button>
            <div id='message'>Authenticating</div>
            <div id='login'>
                <div style="display: flex; flex-direction: column; gap: 10px">
                    <div>
                        <label for="email">Email</label>
                        <input type="email" name="email" id="email">
                    </div>
                    <div>
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password">
                    </div>
                    <div>
                        <button id="loginButton">Login</button>
                    </div>
                    <div id="error" style="display: none; color: red;">Invalid email or password</div>
                </div>
            </div>
        </div>
    </body>
    </html>
`