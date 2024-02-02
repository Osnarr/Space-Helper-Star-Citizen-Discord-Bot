# SpaceHelper-Star-Citizen-Discord-Bot

  <p>Welcome to the Star Citizen Discord Bot! This bot brings Star Citizen information to your Discord server. It
        includes features to fetch data about ships, organizations, systems, it also comes with 3 already made modules (welcome message, welcome role, logs) I'am planning on making more modules for the dasboard in the near future.... Additionally, it comes with a
        user-friendly dashboard powered by Soft UI made by <a href="https://assistantscenter.com" target="_blank">Assistants Center</a>.
    </p>

  <h2>Features</h2>

  <h3>Ship/System/Org Search Command</h3>

   <p>Use the <code>/search</code> command to fetch information about Star Citizen ships, organizations, systems, and
        more. The bot interacts with a dedicated API to provide accurate and up-to-date details.
    </p>

  <pre><code>/search name Carrack</code></pre>

  <h3>General Commands</h3>

  <ul>
      <li><code>/help</code>: Display a list of available commands and their descriptions.</li>
      <li><code>/rules [channel]</code>: Send predefined rules to a channel of your choice. Then it will send an embed message with an button which they need to click to accept the rules, the role will be automatically created if it does not exist already.</li>
      <li><code>/botinfo</code>: Display some information about the bot.</li>
      <li><code>/serverinfo</code>: Display some information about your server</li>
      <li><code>/userinfo [user]</code>: Display some information about an user of your choice.</li>

  </ul>

  <h3>Moderation Commands</h3>

   <ul>
     <li><code>/kick [user] [reason]</code>: Kick a user from the server.</li>
     <li><code>/ban [user] [reason]</code>: Ban a user from the server.</li>
     <li><code>/timeout [user] [duration] [reason (optional)]</code>: Timeout a user on the server.</li>
     <li><code>/purge [amount]</code>: Purge users messages from the server.</li>
  </ul>

  <h3>Star Citizen Commands</h3>

   <ul>
     <li><code>/search name [model]</code>: Search information about ship model</li>
     <li><code>/search name [system]</code>: Search information about star system</li>
     <li><code>/search name [org]</code>: Search information about organization</li>
     <li><code>/search name [video]</code>: Search video about ship model</li>
     <li><code>/search name [image]</code>: Search images about the ship model</li>
     <li><code>/rsistatus</code>: This will display the current status of RSI Services</li>
     <li><code>/incident</code>: This will display on going RSI incident</li>
     <li><code>/patchnotes [patchnote version]</code>: Get full patchnote of the game version of your choice</li>

  </ul>

  <h4>Star Citizen Lore Commands</h4>
     <li><code>TBA</code>: TBA</li>


  <h2>Dashboard</h2>

  <p>The bot comes with an open-source dashboard built with Soft UI. This web interface allows server admins to manage
        bot settings, and perform various actions in a user-friendly environment.
  </p>

  <p>To access the dashboard, visit 
    <a href="http://localhost:3000"
       target="_blank">localhost</a>.
  </p>

  <h2>Installation</h2>

  <ol>
      <li>Clone the repository:
      
  <pre><code>git clone https://github.com/Osnarr/Space-Helper-Star-Citizen-Discord-Bot.git</code></pre>

  </li>
  <li>Install dependencies:
  
  <pre><code>npm install</code></pre>
  </li>

  <li>Configure your bot token and other settings in the <code>config.json</code> file.</li>
    
<li>Run the bot:
  <pre><code>node index.js</code></pre>
  </li>
  <li>Visit the dashboard at 
    <a href="http://localhost:3000" 
      target="_blank">
      http://localhost:3000</a>.
  </li>
  </ol>

  <h2>Prerequisites</h2>

  <p>Before running the bot, make sure you have the following:</p>

  <ul>
        <li>Node.js and npm installed</li>
        <li>MongoDB database for storing bot data</li>
        <li>Discord Bot Token (create one at 
          <a href="https://discord.com/developers/applications"
             target="_blank">Discord Developer Portal</a>)</li>
    </ul>

  <h2>Stack</h2>

  <p>The bot is built using the following technologies:</p>

  <ul>
      <li>Node.js</li>
      <li>Discord.js for interacting with Discord API</li>
      <li>Mongoose for MongoDB integration</li>
      <li>Soft UI for the dashboard</li>
  </ul>

  <h2>Troubleshooting</h2>

  <p>If you encounter any issues or have questions, please check the <a
            href="https://github.com/Osnarr/Space-Helper-Star-Citizen-Discord-Bot/issues" target="_blank">Issues section</a> or create a new issue if you require help.
  </p>

 <h2>TODO List</h2>

  <ul>
    <li>Implement more modules for dashboard.</li>
    <li>Enhance error handling for invalid queries.</li>
    <li>Add additional ship details to the API response.</li>
    <li>Optimize the code</li>
    <li>.....</li>

  </ul>

  <h2>Contributing</h2>

  <p>Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.
  </p>

  <h2>License</h2>

  <p>This project is licensed under the MIT License - see the <a href="LICENSE" target="_blank">LICENSE</a> file for details.
  </p>
