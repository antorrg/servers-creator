import type { ProjectConfig } from "../../../types.js"

const fileSession = {
  import: `import Session from './session.model.js'`,
  line: `,
  Session`,
  function: 'const Session = modelsDefinition.Session(sequelize)'
}
const emptyFile = {
  
    import: '',
    line: ``,
    function: ''
}

  export const seqAuthIndex = (options: ProjectConfig)=>{
  if(options.selectedAuth.endsWith('-session')){return fileSession}
  return emptyFile

}
/*    ]
    export const optionAuth = [
      { name: "1) None", value: "auth-null" },
      { name: "2) Auth with session and cookies", value: "auth-session" },
      { name: "3) Auth with jwt (access and refresh)", value: "auth-jwt" },
      { name: "4) Auth with jwt an white-list (access and refresh)", value: "auth-jwt-db" },*/