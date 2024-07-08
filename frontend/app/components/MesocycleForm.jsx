import React, { useState } from "react";
import { muscleGroups, exercises, days } from '../constants/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const MesocycleForm = ({ onSubmit }) => {
    // Initialiserer plan state med riktig struktur for dager og øvelser
    const [plan, setPlan] = useState(Array(3).fill().map(() => ({ label: '', exercises: [] })));

    // Oppdaterer state når det skjer en endring i en øvelse
    const handleChange = (dayIndex, exerciseIndex, field, value) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex] = {
            ...updatedPlan[dayIndex],
            exercises: [...updatedPlan[dayIndex].exercises]
        };
        updatedPlan[dayIndex].exercises[exerciseIndex] = {
            ...updatedPlan[dayIndex].exercises[exerciseIndex],
            [field]: value
        };
        setPlan(updatedPlan);
    };

    // Legger til en ny øvelse for en spesifikk dag
    const handleAddExercise = (dayIndex) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex].exercises.push({ muscleGroup: '', exercise: '' });
        setPlan(updatedPlan);
    };

    // Fjerner en øvelse fra en spesifikk dag
    const handleRemoveExercise = (dayIndex, exerciseIndex) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex].exercises.splice(exerciseIndex, 1);
        setPlan(updatedPlan);
    };

    // Legger til en ny dag med riktig struktur
    const handleAddDay = () => {
        setPlan([...plan, { label: '', exercises: [] }]);
    };

    // Fjerner en dag fra planen
    const handleRemoveDay = (dayIndex) => {
        const updatedPlan = [...plan];
        updatedPlan.splice(dayIndex, 1);
        setPlan(updatedPlan);
    }
    
    // Oppdaterer label for en spesifikk dag
    const handleLabelChange = (dayIndex, value) => {
        const updatedPlan = [...plan];
        updatedPlan[dayIndex].label = value;
        setPlan(updatedPlan);
    }

    // Håndterer innsending av skjemaet
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(plan);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button type="submit" style={{ marginTop: '20px' }}>Save Plan</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {plan.map((day, dayIndex) => (
                        <div key={dayIndex} style={{ margin: '0 10px', flex: 1 }}>

                            <label>
                                Label:
                                <select
                                    value={day.label}
                                    onChange={(e) => handleLabelChange(dayIndex, e.target.value)}
                                    required
                                >
                                    <option value="">Add a Label</option>
                                    {days.map(dayLabel => (
                                        <option key={dayLabel} value={dayLabel}>{dayLabel}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => handleRemoveDay(dayIndex)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </label>
                            {day.exercises.map((exercise, exerciseIndex) => (
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
