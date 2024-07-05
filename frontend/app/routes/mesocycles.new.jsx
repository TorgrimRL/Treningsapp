import React from "react";
import MesocycleForm from "../components/MesocycleForm";

export default function NewMesocycle() {
    const handleSubmit = (plan) => {
        console.log('Submitted plan:', plan);
    };

    return(
        <div>
            <h1>Create a new mesocycle</h1>
            <MesocycleForm onSubmit={handleSubmit}/>
        </div>
    );
}