import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Camera, Canvas, Collider, GameObject, Transform, Object } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { UnityEvent } from 'UnityEngine.Events';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
 
export default class InteractionIcon extends ZepetoScriptBehaviour {
     
    // Icon
    @Header("[Icon]")
    @SerializeField() private prefIconCanvas: GameObject;
    @SerializeField() private iconPosition: Transform;
     
    // Unity Event    
    @Header("[Unity Event]")
    public OnClickEvent: UnityEvent;
    public OnTriggerEnterEvent: UnityEvent;
    public OnTriggerExitEvent: UnityEvent;
 
    private _button: Button;
    private _canvas: Canvas;   
    private _cachedWorldCamera: Camera;
    private _isIconActive: boolean = false;
    private _isDoneFirstTrig: boolean = false;
     
     
    private Update() {
        console.log("H");
        if (this._isDoneFirstTrig && this._canvas?.gameObject.activeSelf) {
            this.UpdateIconRotation();
        }
    }
     
    private OnTriggerEnter(coll: Collider) {
        console.log("A")
        if (coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()) {
            return;
        }
        console.log("B");
        this.ShowIcon();
        this.OnTriggerEnterEvent?.Invoke();
    }
 
    private OnTriggerExit(coll: Collider) {
        if (coll != ZepetoPlayers.instance.LocalPlayer?.zepetoPlayer?.character.GetComponent<Collider>()) {
            return;
        }
         
        this.HideIcon();
        this.OnTriggerExitEvent?.Invoke();
    }
     
    public ShowIcon(){
        console.log("C");
        if (!this._isDoneFirstTrig) {
            console.log("D");
            this.CreateIcon();
            this._isDoneFirstTrig = true;
        }
        else {
            this._canvas.gameObject.SetActive(true);
        }
        this._isIconActive = true;
    }
     
    public HideIcon() {
        this._canvas?.gameObject.SetActive(false);
        this._isIconActive = false;
    }
 
    private CreateIcon() {
        console.log("E");
        if (this._canvas === undefined) {
            console.log("F");
            const canvas = GameObject.Instantiate(this.prefIconCanvas, this.iconPosition) as GameObject;
            this._canvas = canvas.GetComponent<Canvas>();
            this._button = canvas.GetComponentInChildren<Button>();
            this._canvas.transform.position = this.iconPosition.position;
            console.log("G");
        }
        this._cachedWorldCamera = Object.FindObjectOfType<Camera>();
        this._canvas.worldCamera = this._cachedWorldCamera;
 
        this._button.onClick.AddListener(() => {
            this.OnClickIcon();
        });
    }
     
    private UpdateIconRotation() {
        console.log("I");
        this._canvas.transform.LookAt(this._cachedWorldCamera.transform);
    }
 
    private OnClickIcon() {
        this.OnClickEvent?.Invoke();
    }
}