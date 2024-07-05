import React, {useState} from "react";
import { muscleGroups, exercises} from '../constants/constants'

const MesocycleForm = ({ onSubmit }) => {
    const [plan, setPlan] = useState(
        Array(7).fill().map(() => Array(8).fill({ muscleGroup: '', exercise: ''}))
    );

const handleChange = (dayIndex, exerciseIndex, field, value) => {
    const updatedPlan = [...plan];
    updatedPlan[dayIndex] = [...updatedPlan[dayIndex]]; 
    updatedPlan[dayIndex][exerciseIndex] = {
        ...updatedPlan[dayIndex][exerciseIndex], 
        [field]: value 
    };
    setPlan(updatedPlan);
};


    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(plan);
    };

    return(
        <form onSubmit={handleSubmit}>
            {plan.map((day,dayIndex) => (
                <div key={dayIndex}>
                    <h3>Day {dayIndex+1}</h3>
                    {day.map((exercise,exerciseIndex) => (
                        <div key={exerciseIndex}>
                            <label>
                                Muscle Group:
                                <select
                                    value={exercise.muscleGroup}
                                    onChange={(e) => handleChange(dayIndex,exerciseIndex,'muscleGroup', e.target.value)}
                                    required
                                >
                                    {muscleGroups.map(group =>(
                                        <option key={group} value= {group}>{group}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Exercise:
                                <select
                                    value={exercise.exercise}
                                    onChange={(e) => handleChange(dayIndex,exerciseIndex,'exercise', e.target.value)}
                                    required
                                >
                                    {exercises
                                        .filter(ex => ex.muscleGroup === exercise.muscleGroup)
                                        .map(ex => (
                                            <option key={ex.name} value={ex.name}>{ex.name}</option>
                                        ))
                                    }
                                </select>
                            </label>
                        </div>
                    ))}
                </div>
            ))}
            <button type="submit">Save Plan</button>
        </form>
    );
};
export default MesocycleForm