import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {Player, State, Vector3} from "ZEPETO.Multiplay.Schema";
import {CharacterState, SpawnInfo, ZepetoPlayers, CharacterJumpState, ZepetoPlayer} from "ZEPETO.Character.Controller";
import * as UnityEngine from "UnityEngine";
import {GameObject} from "UnityEngine";

export default class Client extends ZepetoScriptBehaviour {
    public multiPlay : ZepetoWorldMultiplay;
    private room : Room
    private zepetoPlayer : ZepetoPlayer
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    //싱글톤
    private static instance: Client = null;
    public static getInstance(): Client {
        if (this.instance == null) {
            this.instance = GameObject.FindObjectOfType<Client>();
        }
        return this.instance;
    }

    Start() {
        this.multiPlay.RoomCreated += (room:Room) => {
            this.room = room
        }

        this.multiPlay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1))
    }

    private * SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);
            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    //getplyaer는 룸에서 나를 반환하는 코드
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle) {
                        this.sendTransform(myPlayer.character.transform)
                    }
                }
            }
        }

    }

    //클라이언트 방 입장
    private OnStateChange(state: State, isFirst: boolean) {
        if (isFirst) {
            //제페토 플레이어(생성된 객체)에 이벤트 리스너 등록 : 오브젝트 생성될때(내가 방에들어왔을때) 맨처음 1번만 하면됨 sendState함수 붙이기
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                //생성된 내 플레이어 오브젝트
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
                this.zepetoPlayer = myPlayer
                //동적생성된 캐릭터에 리스너추가
                this.room.Send('echo','로컬 생성')
                myPlayer.character.OnChangedState.AddListener((cur) => {
                    this.SendState(cur);
                    console.log("리스너추가 작업 실행입니다!")
                });
            });
            //다른 플레이어의 position 입력받기위해 나말고 존재하는 다른 사람의 오브젝트에 listener 추가
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId:string) => {
                this.room.Send('echo','로컬 아님 생성')
                const isLocal = this.room.SessionId === sessionId;
                //멀티방이면
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);
                    player.OnChange += (ChangeValues) => this.OnUpdatePlayer(sessionId, player)
                }
            });
        }

        //원래있던사람 빼고 새로 추가된 사람들
        let join = new Map<string, Player>();
        //나가서 지울사람들
        let leave: Map<string, Player> = new Map<string, Player>(this.currentPlayers);

        //state에 있는 player들을 join에 추가, state는 자동으로 변경감지가 되는듯 (schema에 players map을 정의해뒀는데 shcema의 state는 변경감지가 가능한걸로 보임)
        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player)
            }
            //leave는 지울사람들만 남아야함 state변경 감지 해서 있는사람이면 leave맵에서 제거 idea -> 전체 - 지금 있는 사람 = 나간사람임
            leave.delete(sessionId)
        });
        //새로추가된 사람들만 여기서 플레이어 인스턴스 생성, currentPlayers에도 추가
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));
        //나간사람 캐릭터 지우기
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player))
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {
        const position = this.ParseVector3(player.transform.position);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        //위치이동
        zepetoPlayer.character.MoveToPosition(position);

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove) {
            zepetoPlayer.character.Jump()
        }
    }

    private ParseVector3(vector3:Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3(
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        if(state === CharacterState.Jump) {
            data.Add("subState", this.zepetoPlayer.character.motionState.currentJumpState);
        }
        this.room.Send("onChangedState", data.GetObject());
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`onjoins ${sessionId}`)
        this.currentPlayers.set(sessionId, player)

        const spawnInfo = new SpawnInfo();
        const position = new UnityEngine.Vector3(0, 0, 0);
        const rotation = new UnityEngine.Vector3(0, 0, 0);
        spawnInfo.position = position
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation)

        const isLocal = this.room.SessionId === player.sessionId;
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`room leave session id : ${sessionId}`);
        this.currentPlayers.delete(sessionId);
        ZepetoPlayers.instance.RemovePlayer(sessionId)
    }

    //변경위치 룸으로 전송하기
    //룸은 onMessage에서 수신받음
    private sendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();
        const pos = new RoomData()
        pos.Add('x', transform.localPosition.x);
        pos.Add('y', transform.localPosition.y);
        pos.Add('z', transform.localPosition.z);
        data.Add('position', pos.GetObject());

        const rotation = new RoomData();
        rotation.Add('x', transform.localEulerAngles.x);
        rotation.Add('y', transform.localEulerAngles.y);
        rotation.Add('z', transform.localEulerAngles.z);
        data.Add('rotation', rotation.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    public getCurrentPlayers() {
        return this.currentPlayers;
    }
}