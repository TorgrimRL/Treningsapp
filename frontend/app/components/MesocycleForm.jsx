import React, { useState } from "react";
import { muscleGroups, exercises } from '../constants/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const MesocycleForm = ({ onSubmit }) => {
    const [plan, setPlan] = useState(Array(3).fill().map(() => []));

    const handleChange = (dayIndex, exerciseIndex, field, value) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex] = [...updatedPlan[dayIndex]];
        updatedPlan[dayIndex][exerciseIndex] = {
            ...updatedPlan[dayIndex][exerciseIndex],
            [field]: value
        };
        setPlan(updatedPlan);
    };

    const handleAddExercise = (dayIndex) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex].push({ muscleGroup: '', exercise: '' });
        setPlan(updatedPlan);
    };

    const handleRemoveExercise = (dayIndex, exerciseIndex) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex].splice(exerciseIndex, 1);
        setPlan(updatedPlan);
    };

    const handleAddDay = () => {
        setPlan([...plan,[]]);
    };

    const handleRemoveDay = (dayIndex) => {
        const updatedPlan = [...plan];
        updatedPlan.splice(dayIndex, 1);
        setPlan(updatedPlan);
    }
    
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(plan);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center' }}>
            <button type="submit" style={{ marginTop:'20px'}}>Save Plan</button>
                <div style={{ display:'flex', justifyContent: 'space-between',width:'100%' }}>
                    {plan.map((day, dayIndex) => (
                        <div key={dayIndex} style={{ margin: '0 10px', flex: 1 }}>
                            <h3 style={{ display: 'flex', justifyContent:'space-between'}}>
                            Day {dayIndex + 1}
                            <button type="button" onClick={() => handleRemoveDay(dayIndex)}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </button>
                            </h3>
                        {day.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} style={{ marginBottom: '10px' }}>
                                <label>
                                    Muscle Group:
                                    <select
                                        value={exercise.muscleGroup}
                                        onChange={(e) => handleChange(dayIndex, exerciseIndex, 'muscleGroup', e.target.value)}
                                        required
                                    >   
                                        <option value="">Select a muscle group</option>
                                        {muscleGroups.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Exercise:
                                    <select
                                        value={exercise.exercise}
                                        onChange={(e) => handleChange(dayIndex, exerciseIndex, 'exercise', e.target.value)}
                                        required
                                    >   
                                        <option value="">Select an exercise</option>
                                        {exercises[exercise.muscleGroup]?.map(ex => (
                                            <option key={ex} value={ex}>{ex}</option>
                                        ))}
                                    </select>
                                </label>
                                <button type="button" onClick={() => handleRemoveExercise(dayIndex, exerciseIndex)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => handleAddExercise(dayIndex)}>Add Muscle Group</button>
                    </div>
                ))}
                    <div style={{ alignSelf: 'flex-start', marginLeft: '20px' }}>
                        <button type="button" onClick={handleAddDay} style={{ height: 'fit-content', marginTop: '15px' }}>+ Add a day</button>
                    </div>
            </div>
           </div>
        </form>
    );
};

export default MesocycleForm;
