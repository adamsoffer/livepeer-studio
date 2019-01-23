export default () => (
  <form action="/confirmEmail" method="post">
    <fieldset>
      <legend>Enter Your Information</legend>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          defaultValue="adam@soffer.space"
          placeholder="email"
        />
      </div>
      <div>
        <input
          type="text"
          name="account"
          defaultValue="0x58b6a8a3302369daec383334672404ee733ab239"
          placeholder="account"
        />
      </div>
      <select name="frequency">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <button type="submit" value="Submit">
        SIGN UP
      </button>
    </fieldset>
  </form>
)
