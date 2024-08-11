import{a as O,c as j}from"/build/_shared/chunk-T4TVODSB.js";import{a as M,b as z,c as A,d as J}from"/build/_shared/chunk-7E7ZLBTN.js";import"/build/_shared/chunk-KVFERVVR.js";import{a as R}from"/build/_shared/chunk-A7L52TKV.js";import"/build/_shared/chunk-VQOUZTVV.js";import{n as U,o as _}from"/build/_shared/chunk-ZYSMYXEW.js";import"/build/_shared/chunk-M2LT2RZF.js";import{d as p,f as E,g as k}from"/build/_shared/chunk-DLUJ32DX.js";var T=p(E(),1);var x=p(E(),1);var Q=p(R(),1);var V=p(E(),1),$=p(R(),1),d=p(k(),1);$.default.setAppElement("#root");var xe=({isOpen:y,onRequestClose:l,muscleGroups:i,onSave:h})=>{let[g,b]=(0,V.useState)(i.reduce((u,v)=>({...u,[v]:"secondary"}),{})),f=(u,v)=>{b(C=>({...C,[u]:v}))},m=()=>{h(g),l()};return(0,d.jsxs)($.default,{isOpen:y,onRequestClose:l,contentLabel:"Muscle Group Settings",children:[(0,d.jsx)("button",{onClick:l,className:"absolute top-0 right-2 m-0 p-0 text-3xl text-gray-600 hover:text-gray-800",children:"\xD7"}),(0,d.jsx)("h1",{children:"Muscle Group Progressions"}),i.map(u=>(0,d.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"10px"},children:[(0,d.jsx)("span",{children:u}),(0,d.jsxs)("div",{children:[(0,d.jsx)("button",{type:"button",onClick:()=>f(u,"primary"),className:`mr-2 px-4 py-2 ${g[u]==="primary"?"bg-black text-white":"bg-gray-300 text-white"}`,children:"Primary"}),(0,d.jsx)("button",{type:"button",onClick:()=>f(u,"secondary"),className:`px-4 py-2 ${g[u]==="secondary"?"bg-gray-500 text-white":"bg-gray-300 text-white"}`,children:"Secondary"})]})]},u)),(0,d.jsx)("h3",{children:"About progression rates"}),(0,d.jsx)("text",{children:"Priority muscle groups will be progressed based on your feedback to optimize muscle growth, potentially adding many sets if you're responding well. This will enhance growth opportunities but also require more time and effort in your training sessions."}),(0,d.jsxs)("div",{className:"flex justify-end mt-4",children:[(0,d.jsx)("button",{onClick:m,className:"mt-4 bg-black text-white px-4 py-2 mr-2",children:"Save"}),(0,d.jsx)("button",{onClick:l,className:"mt-4 bg-gray-500 text-white px-4 py-2",children:"Close"})]})]})},X=xe;var we=p(E(),1),w=p(E(),1);var H=p(R(),1),c=p(k(),1),ge=({isOpen:y,onRequestClose:l,onSave:i})=>{let[h,g]=(0,w.useState)(""),[b,f]=(0,w.useState)(""),[m,u]=(0,w.useState)(""),[v,C]=(0,w.useState)("");(0,w.useEffect)(()=>{console.log("AddExerciseModal visibility",y)},[y]);let P=()=>{let n={name:h,type:b,muscleGroup:m,videolink:v};console.log("Saving exercise:",n),i(n),l()};return(0,c.jsxs)(H.default,{isOpen:y,onRequestClose:l,contentlabel:"Custom exercises",className:" relative mx-4 md:mx-auto  bg-darkGray text-white rounded focus:outline-none shadow-lg  p-0 max-w-3xl mx-auto mt-20 text-2sm ",overlayClassName:"fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50",children:[(0,c.jsx)("button",{onClick:l,className:"absolute top-0 right-2 text-3xl hover:text-gray-800",children:"\xD7"}),(0,c.jsxs)("div",{className:"flex flex-col p-4 ",children:[(0,c.jsx)("header",{className:"bold text-2xl mb-4 mt-2 ",children:"Add a custom exercise"}),(0,c.jsxs)("form",{children:[(0,c.jsx)("label",{className:"mb-4 block",children:(0,c.jsx)("input",{type:"text",value:h,placeholder:"Enter name of exercise here",onChange:n=>g(n.target.value),required:!0,className:"bg-inputBGGray text-center w-full p-1"})}),(0,c.jsxs)("label",{children:["Exercise type:",(0,c.jsxs)("select",{value:b,onChange:n=>f(n.target.value),required:!0,className:"bg-inputBGGray text-center w-full p-1",children:[(0,c.jsx)("option",{value:"",disabled:!0,children:"Select type"}),z.map(n=>(0,c.jsx)("option",{value:n,children:n},n))]})]}),(0,c.jsxs)("label",{children:["Muscle Group",(0,c.jsxs)("select",{value:m,onChange:n=>u(n.target.value),required:!0,className:"bg-inputBGGray text-center w-full p-1",children:[(0,c.jsx)("option",{value:"",disabled:!0,children:"Select muscle group"}),M.map(n=>(0,c.jsx)("option",{value:n,children:n},n))]})]}),(0,c.jsxs)("label",{className:"mb-4 block",children:["Video Link",(0,c.jsx)("input",{type:"url",value:v,onChange:n=>C(n.target.value),required:!0,className:"bg-inputBGGray text-center w-full p-1"})]}),(0,c.jsx)("div",{className:"p-4 flex justify-center",children:(0,c.jsx)("button",{onClick:P,className:"bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-large flex justify center",children:"Save exercise"})})]})]})]})},K=ge;var o=p(k(),1);Q.default.setAppElement("#root");var he=({onSubmit:y})=>{let[l,i]=(0,x.useState)(Array(1).fill().map(()=>({label:"",exercises:[{muscleGroup:"",exercise:"",sets:[{},{}]}]}))),[h,g]=(0,x.useState)(!1),[b,f]=(0,x.useState)(""),[m,u]=(0,x.useState)(""),[v,C]=(0,x.useState)({}),P=U(),{template:n,weeks:ee,daysPerWeek:B,muscleGroups:q,dayLabels:te}=P.state||{},[oe,F]=(0,x.useState)(!1),[se,W]=(0,x.useState)({}),D=process.env.REACT_APP_API_URL;(0,x.useEffect)(()=>{(async()=>{try{let e=await fetch(`${D}/api/exercises`,{method:"GET",headers:{"Content-Type":"application/json"},credentials:"include"});if(e.ok){let r=await e.json();W(r.reduce((a,t)=>(a[t.muscleGroup]||(a[t.muscleGroup]=[]),a[t.muscleGroup].push(t.name),a),{}))}else{let r=await e.text();throw new Error(`Failed to fetch exercises: ${r}`)}}catch(e){console.error("Error fetching exercises",e)}})()},[]);let re=()=>{F(!0)},ae=async s=>{if(s){let{name:e,muscleGroup:r}=s;console.log("New exercise to add:",s),W(a=>{console.log("Previous custom exercises:",a);let t={...a};return t[r]?t[r]=[...t[r],e]:t[r]=[e],console.log("Updated custom exercises:",t),t});try{let a=await fetch(`${D}/api/exercises`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(s)});if(!a.ok){let t=await a.text();throw new Error(`Failed to update customexercises: ${t}`)}}catch{console.error("Error trying to send exercise to backend")}}},le=_();(0,x.useEffect)(()=>{if(n){u(ee||m);let s=Array.from({length:B},(e,r)=>({label:te[r],exercises:q[r]?.map(a=>({muscleGroup:a,exercise:"",sets:[{},{}]}))||[]}));i(s)}},[n,B,q]);let L=(s,e,r,a)=>{let t=[...l],N=t[s].exercises[e].muscleGroup,S=A[N]?.find(ye=>ye.name===a);t[s]={...t[s],exercises:[...t[s].exercises]},t[s].exercises[e]={...t[s].exercises[e],[r]:a,type:r==="exercise"&&S?S.type:t[s].exercises[e].type,priority:r==="muscleGroup"?v[a]:t[s].exercises[e].priority},i(t)},ne=s=>{let e=[...l];e[s].exercises.push({muscleGroup:"",exercise:"",sets:[{completed:!1,targetWeight:0,targetReps:0},{completed:!1,targetWeight:0,targetReps:0}]}),i(e)},ce=(s,e)=>{let r=[...l];r[s].exercises.splice(e,1),i(r)},ie=()=>{i([...l,{label:"",exercises:[]}])},ue=s=>{let e=[...l];e.splice(s,1),i(e)},pe=(s,e)=>{let r=[...l];r[s].label=e,i(r)},me=s=>{s.preventDefault(),console.log("Training Block Name: ",b),console.log("Weeks:",m),g(!0)},de=s=>{C(s);let e=[...l],r=[];for(let t=0;t<m;t++)r.push(...e.map(N=>({...N,exercises:N.exercises.map(S=>({...S,priority:s[S.muscleGroup]}))})));let a={name:b,weeks:m,daysPerWeek:e.length,plan:r,completedDate:null,isCurrent:!0};y(a),g(!1),le("../currentworkout")},be=()=>{let s=l.map(e=>({...e,exercises:e.exercises.map(r=>{let a=r.exercise||fe(r.muscleGroup),t=A[r.muscleGroup]?.find(N=>N.name===a)?.type;return{...r,exercise:a,type:t}})}));i(s)},fe=s=>{let e=A[s];return e&&e.length>0?e[Math.floor(Math.random()*e.length)].name:""};return(0,o.jsxs)("form",{onSubmit:me,children:[(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[" ",(0,o.jsxs)("div",{className:"text-center border-black mb-10 p-4 border border-black border-thick",children:[(0,o.jsxs)("label",{className:"mb-4 block",children:["Training Block Name:",(0,o.jsx)("input",{type:"text",value:b,placeholder:"Enter name of training block here",onChange:s=>f(s.target.value),required:!0,className:"bg-inputBGGray text-center border-black w-full p-1"}),(0,o.jsxs)("label",{className:" mb-4 block",children:["Number of weeks:",(0,o.jsxs)("select",{value:m,onChange:s=>u(s.target.value),required:!0,className:"bg-inputBGGray text-center border-black w-full p-1",children:[(0,o.jsx)("option",{value:"",disabled:!0,children:"Select Weeks"}),(0,o.jsx)("option",{value:4,children:"4"}),(0,o.jsx)("option",{value:5,children:"5"}),(0,o.jsx)("option",{value:6,children:"6"})]})]})]}),(0,o.jsx)("button",{type:"submit",style:{marginTop:"20px"},className:"bg-red-600 text-white border-none py-2 px-4 cursor-pointer text-lg  mr-4",children:"Save Plan"}),(0,o.jsx)("button",{style:{marginTop:"20px"},className:`bg-red-600 text-white border-none py-2 px-4
            cursor-pointer text-lg `,onClick:be,children:"Auto Fill Exercises"})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"start",width:"100%",overflow:"auto"},children:[l.map((s,e)=>(0,o.jsxs)("div",{style:{margin:"0 5px",flex:1},className:"bg-darkestGray border-gray-700 shadow-lg p-1 mb-6  max-w-sm",children:[(0,o.jsxs)("label",{className:"flex items-center justify-between mb-2",children:[(0,o.jsxs)("select",{value:s.label,onChange:r=>pe(e,r.target.value),required:!0,className:"bg-darkestGray text-center border border-gray-400 w-40 p-1 flex flex-col",children:[(0,o.jsx)("option",{value:"",children:"Add a Label"}),J.map(r=>(0,o.jsx)("option",{value:r,children:r},r))]}),(0,o.jsx)("button",{type:"button",onClick:()=>ue(e),children:(0,o.jsx)(O,{icon:j})})]}),s.exercises.map((r,a)=>(0,o.jsxs)("div",{className:"flex justify-between flex-col bg-darkGray border  border-gray-700 max-w p-3 mb-3",children:[(0,o.jsxs)("div",{className:"flex justify-between items-center mb-2",children:[(0,o.jsx)("div",{className:"flex flex-col",children:(0,o.jsxs)("label",{children:["Muscle Group:",(0,o.jsxs)("select",{value:r.muscleGroup,onChange:t=>L(e,a,"muscleGroup",t.target.value),className:"bg-darkestGray text-center border border-gray-400 w-50 rounded p-1 flex flex-col",required:!0,children:[(0,o.jsx)("option",{value:"",children:"Select a muscle group"}),M.map(t=>(0,o.jsx)("option",{value:t,children:t},t))]})]})}),(0,o.jsx)("button",{type:"button",onClick:()=>ce(e,a),className:"text-white hover:text-red-800 ml-2",style:{position:"relative",top:"-1.1rem"},children:(0,o.jsx)(O,{icon:j})})]}),(0,o.jsx)("div",{className:"flex  mb-2",children:(0,o.jsxs)("label",{className:"flex flex-col w-full",children:["Exercise:",(0,o.jsxs)("select",{value:r.exercise,onChange:t=>L(e,a,"exercise",t.target.value),required:!0,className:"bg-darkestGray text-center border border-gray-400 w-full rounded p-1 flex flex-grow",children:[(0,o.jsx)("option",{value:"",children:"Select an exercise"}),A[r.muscleGroup]?.map(t=>(0,o.jsx)("option",{value:t.name,children:t.name},t.name)),se[r.muscleGroup]?.map(t=>(0,o.jsx)("option",{value:t,children:t},t))]})]})}),(0,o.jsx)("button",{type:"button",onClick:re,className:"text-sm",children:"Add custom exercise"})]},a)),(0,o.jsx)("button",{type:"button",onClick:()=>ne(e),className:"flex w-full justify-between items-center bg-darkGray border border-gray-700 w-55 p-3 mb-3",children:"+ ADD MUSCLE GROUP"})]},e)),(0,o.jsx)("div",{style:{flex:"0 0 200px",alignSelf:"flex-start"},children:(0,o.jsx)("button",{type:"button",onClick:ie,className:"flex w-full justify-between items-center h-10 bg-darkestGray border border-gray-700 w-55 p-3 mb-3",style:{height:"",marginTop:""},children:"+ Add a day"})})]})]}),(0,o.jsx)(X,{isOpen:h,onRequestClose:()=>g(!1),muscleGroups:M,onSave:de,href:"../current-workout"}),(0,o.jsx)(K,{isOpen:oe,onRequestClose:()=>F(!1),onSave:ae})]})},Y=he;var Z=y=>{let i=`; ${document.cookie}`.split(`; ${y}=`);if(i.length===2)return i.pop().split(";").shift()};var G=p(k(),1);function I(){let[y,l]=(0,T.useState)(""),i=process.env.REACT_APP_API_URL;(0,T.useEffect)(()=>{(async()=>{let m=await(await fetch(`${i}/csrf-token`,{method:"GET",credentials:"include"})).json();l(m.csrfToken)})()},[]);let h=async b=>{try{let f=Z("token");console.log("Retrieved token:",f);let m=await fetch(`${i}/api/mesocycles`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-Token":y,Authorization:`Bearer ${f}`},credentials:"include",body:JSON.stringify(b)});if(!m.ok)throw new Error("Network response was not ok");let u=await m.json();console.log("Mesocycle created:",u)}catch(f){console.error("There was a problem with the fetch operation",f)}};return(0,G.jsxs)("div",{className:" text-white bg-darkGray",children:[(0,G.jsx)("div",{style:{paddingTop:"30px"}}),(0,G.jsx)("h1",{children:"Create a new mesocycle"}),(0,G.jsx)(Y,{onSubmit:b=>{h(b)}}),(0,G.jsx)("div",{id:"root"})]})}export{I as default};