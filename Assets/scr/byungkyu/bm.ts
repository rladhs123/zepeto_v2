import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Image } from 'UnityEngine.UI';
import { Animator, AnimationClip, Sprite} from 'UnityEngine';

export default class bm extends ZepetoScriptBehaviour {

    public sprites: Sprite[];
    public isClicked: bool;
    public button: Button;

    CrouchButtonClick(){
        this.isClicked = !this.isClicked;
        if(this.isClicked) this.button.GetComponent<Image>().sprite = this.sprites[0];
        else this.button.GetComponent<Image>().sprite = this.sprites[1];
    }

}