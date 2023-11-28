import { Animation } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class OpenBox extends ZepetoScriptBehaviour {
    private ani : Animation;
    Start() {    
        this.ani=this.gameObject.GetComponent<Animation>();
        this.ani.Play()
    }

}