import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();
  const [allPets, setAllPets] = useState([]);

  //load all pets from db on mount
  useEffect(() => {
    getPets();
  }, [])


  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSaveResults(){
    //make post request to /data-api/rest/PetName
    //with body of {pet_name: result, pet_type: animalInput}
    //then fetch all pets again
    try {
      //parse all petnames from result which is a comma separate string
      const petNames = result.split(",");
      //loop through each petname and make a post request to /data-api/rest/PetName
      //with body of {pet_name: petName, pet_type: animalInput}
      for(const petName of petNames){
        await PostPetName(petName, animalInput);
      }

      setAnimalInput("");
      getPets();
      setResult();

    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }

  }

  //fetch all pets from db with /data-api/PetNames
  //set result to all pets
  async function getPets() {
    const response = await fetch("/data-api/rest/PetName");
    const data = await response.json();
    setAllPets(data.value);
  }

  async function PostPetName(result, animalInput){
    const response = await fetch("/data-api/rest/PetName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pet_name: result, pet_type: animalInput }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }
  }

  function extractPetTypes(){
    let petTypes = [];
    allPets.forEach(pet => {
      if(!petTypes.includes(pet.pet_type)){
        petTypes.push(pet.pet_type);
      }
    })
    return petTypes;
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Name my pet</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter an animal"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>

        {result && (
            <>
              <div className={styles.result}>{result}</div>
              <button onClick={()=>onSaveResults()}>Save results</button>
            </>
          )
        }

      {allPets && allPets.length > 0 && 
        <div>
          <h3>All pets</h3>
          <ul>
            { extractPetTypes().map((petType) => (
              <div>
                <h4>{petType}</h4>
                <ul>
                  {allPets.filter(pet => pet.pet_type === petType).map(pet => (
                    <li>{pet.pet_name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </ul>
        </div>
      }
      </main>
    </div>
  );
}
