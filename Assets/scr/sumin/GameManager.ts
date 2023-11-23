import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Client from "./Client";
import {GameObject} from "UnityEngine";

//전체 시간, 백신 기계 위치 세팅, 백신 기계 수리 현황, 팀 나누기
export default class GameManager extends ZepetoScriptBehaviour {

    private client:Client;

    //싱글톤
    public static instance:GameManager = null
    public static getInstance() {
        if (this.instance == null) {
            this.instance = GameObject.FindObjectOfType<GameManager>();
        }
        return this.instance
    }

    Start(){
        this.client = Client.getInstance();
    }

    
    //전체 게임 타이머 시작하기
    private timerStart() {

    }

}