import React, {useState} from "react";
import { muscleGroups } from "../constants/constants";

export default function ExerciseForm ({ onSubmit })  {
    const [name,setName] = useState('');
    const [type,setType] = useState('Barbell');
    const [videoLink, setVideoLink] = useState('');
    const [muscleGroup, setMuscleGroup] = useState(muscleGroups[0]);


    const handleSubmit = (event) => {
        event.preventDefault();
        const newExercise = { name, type, videoLink, muscleGroup};
        onSubmit(newExercise);
        setName('');
        setType('Barbel');
        setVideoLink('');
        setMuscleGroup(muscleGroups[0]);
    };


    return(
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Exercise type</label>
                   <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="barbell">Barbell</option>
                        <option value="machine">Machine</option>
                        <option value="dumbbell">Dumbbell</option>
                        <option value="bodyweight">Bodyweight</option>
                        <option value="loaded bodyweight">Loaded Bodyweight</option>
                    </select> 
            </div>
            <div>
                <label>Video link</label>
                <input
                    type="url"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                />
            </div>
            <div>
                <label>Muscle group</label>
                    <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} required>
                        {muscleGroup.map(group => (
                            <option key={group} value={group}></option>
                        ))}
                    </select>
            </div>
            <button type="submit">Add Exercise</button>
        </form>
    )

}