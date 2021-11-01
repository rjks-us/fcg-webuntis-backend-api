const Login = () => {
    return (
      <div className="App">
        <form class="login-form" action="https://api.fcg-app.de/v1/admin/login" method="post">
            <input type="text" name="email"></input>
            <input type="password" name="password" id=""></input>
            <input type="submit" value="Login"></input>
        </form>
        <p id="status-message"></p>
      </div>
    );
}
  
export default Login;  