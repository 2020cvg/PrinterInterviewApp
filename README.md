**Test project:**
Please only spend a 2-3 hours on this. What ever you don't get to just make notes and be prepared to talk about it
Feel free to use whatever tools you have at your disposal.

Please email back either a link to a clone repository, a zip file of your changes, or a diff file for us to look at.

Implement a simple UI that lets us view all the printers that the user is allowed to view all the printers the have access to* and filter them based on if they are connected and when they were last online and search by name of the printer.
*A user who is an admin has access to all printers, other users only have access to printers that they have in their printer_id field

**Important features we would like to see:**

1. If we have a lot of printers the ability to search for them by name and find only the one we want
2. Ability to see whether each printer is online or not online, and their name
3. Be able to remove a printer from our list of printers so it no longer shows up in the list
4. If the user is an admin see all the users connected to a printer, and remove a printer from a user.
5. Extra: Explain how you would improve this project further, and what limitations this basic structure has.

Please do not spend more than a couple hours on this, do not worry about security or cross browser compatibility. This doesn't need to be super pretty, but it should be functional and relatively easy to use. The idea is to make a quick experience to help prove you can deal making a basic experience.

**_To run this project:_**

Install npm dependencies
`npm install`

Start the server:

```
npm run start-server
```

Start the client:

```
npm run start
```
In server/routes.ts we have the basic routes setup to show how it can be done. This can be adjusted if you want different params or data returned.

This project uses MongoDb

Common things you may want to do with a mongo collection:


```
// Find a single item in the collection directly matching the name
const cursor = UserPresenceServers.findOne({name: "Name to search"})

// Find the full list of items matching the query directly matching the name
const cursor = UserPresenceServers.find({name: "Name to search"}).toArray()

// Remove an item from the collections directly matching the name
const cursor = UserPresenceServers.remove({_id:"ID TO REMOVE"})

// Update an item from the collections directly matching the _id
// This one sets the field online true true
const cursor = UserPresenceServers.remove({_id: "id to search"}, {$set: {online: true}})
```

In the server folder is also an example of how we used to keep track of the online/offline status, for this problem it's just there for reference, and not expected that you need to look at it.
