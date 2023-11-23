import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, Mathf, Time} from "UnityEngine";
import {TextMeshProUGUI} from "TMPro";

export default class GameTimer extends ZepetoScriptBehaviour {

    //조정가능 값
    public gamePlayTime: number;
    public timerUi:TextMeshProUGUI;

    //그외 필드
    private active: boolean = true;
    private currentTime: number;
    private interval: number;

    //싱글톤
    public static instance: GameTimer;
    public static getInstance(): GameTimer {
        if (this.instance == null) {
            this.instance = GameObject.FindObjectOfType<GameTimer>();
        }
        return this.instance
    }

    Start() {
        this.currentTime = this.gamePlayTime;
    }

    Update() {
        if (this.active) {
            this.currentTime -= Time.deltaTime;
            //시간 초과 시 좀비팀 승리 메시지 및 동작
            // if (this.currentTime <= 0) {
            //
            // }
            let minutes: number = Mathf.Floor(this.currentTime / 60);
            let seconds: number = Mathf.Floor(this.currentTime % 60);
            this.timerUi.text = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    public timerStart() {
        this.active = true
    }

}