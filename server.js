
/*Importing all the packages needed for the application */
const express=require('express');
const path=require('path');
const fs=require('fs');


//Using helper method to create a unique id for the notes
const uuid=require('./helper/uuid');

//Importing  db json file with notes
let notes=require('./db/db.json');

const PORT="3001";

const app=express();    

/*Middleware used by the App */
app.use(express.static('public'));

// Body parser to extract the request
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


//GET ROUTES

//This route will return the notes.html file from public folder
app.get("/notes",(req,res)=>{
   
    console.log(`${req.method} request received by the server to send the notes.hml`);

    res.sendFile(path.join(__dirname,'/public/notes.html'));
});


//This route will return the notes saved in the json file
app.get('/api/notes',(req,res)=>{
    
    console.log(`${req.method} request received by the server to return the json file`);

    res.status(200).json(notes);
})


//POST ROUTE

 //This will add new note to the json file and notes array and return the new note to client

 app.post('/api/notes',(req,res)=>{

    console.log(`${req.method} requets received by server to  create new note`);
    
    const {title,text}=req.body;
    //Only if the title and text are not empty ,new note is created and saved
    if(title && text){

        const newNote={
            title,
            text,
            id:uuid()
        }

        fs.readFile('./db/db.json','utf-8',(err,data)=>{
        
            if(err){
                console.error("Read Error: "+err);
            }
            else{
                notes=JSON.parse(data);
                notes.push(newNote);
    
                fs.writeFile('./db/db.json',JSON.stringify(notes,null,'\t\t'),(err)=>{
                    if(err){
                        console.error("Write Error : "+err);
                    }
                    else{
                        console.log("New Note successfully added to db file");
                    }
                });
            }
            
        });

        // Creates a response with new note and send it back to the client
        const response = {
            status: 'success',
            body: newNote,
          };

        res.status(200).json(response);  

    }
    else{

        res.status(404).send(`Error: Empty Note.Please retry with a  the title and text`); 
    } 
   
});


//DELETE ROUTE

//This will respond to the delete fetch call from the client
//Look for the id in the notes array and remove it using splice method
//Update the json file using write method of fs
//If no match found respond with an error

app.delete('/api/notes/:id',(req,res)=>{


   for(let i=0;i<notes.length;i++){
        if(notes[i].id===req.params.id){
      
            notes.splice(i,1);

            fs.writeFile('./db/db.json',JSON.stringify(notes,null,'\t\t'),(err)=>{
                if(err){
                    console.error("Write Error : "+err);
                }
                else{
                    console.log("Updated the db file after delete operation");
                }  
            });

            res.json(`Received ${req.method} to remove the note and deleted the note`);
        }
    };
    res.status(404).json(`Error;Note doesnt exist to be deleted`);

   
})


//This wild route will return the index.html starting page of the application
app.get("*",(req,res)=>{
    
    console.log(`${req.method} request received by the server to send the index.hml`);
    
    res.sendFile(path.join(__dirname,'index.html'));
});



app.listen(PORT,()=>{console.log(`App Listening at http://localhost:${PORT}`)});
