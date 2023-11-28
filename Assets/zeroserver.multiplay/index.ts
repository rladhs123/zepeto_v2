import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {DataStorage} from "ZEPETO.Multiplay.DataStorage";
import {Player, Transform, Vector3} from "ZEPETO.Multiplay.Schema";

export default class extends Sandbox {

    //서버에서 사용할 함수 생성 onMessage에 등록하면 해당 messageType으로 호출 해서 사용가능
    onCreate(options: SandboxOptions) {
        // 위치움직인 경우 메시지를 보내고 받을수 있는 listener 추가
        this.onMessage("onChangedTransform", (client, message) => {
            const player = this.state.players.get(client.sessionId);

            const transform = new Transform();
            transform.position = new Vector3();
            transform.position.x = message.position.x;
            transform.position.y = message.position.y;
            transform.position.z = message.position.z;

            transform.rotation = new Vector3();
            transform.rotation.x = message.rotation.x;
            transform.rotation.y = message.rotation.y;
            transform.rotation.z = message.rotation.z;

            if (player) {
                player.transform = transform;
            }
        });

        //방에 사람이 들어왔을때 data 주고 받는 함수
        this.onMessage("onChangedState", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.state = message.state;
            }
        });

        //멀티 서버에 클라이언트가 로그 찍는 함수
        this.onMessage("echo", (client: SandboxPlayer, message: String) => {
            //client에서 server로 보내는코드 .send(server에서도 .send로 보낼 수 있음)
            client.send('echo', `echo message : ${message}`)
        });

        
    }

    async onJoin(client: SandboxPlayer) {
        console.log(`[OnJoin] sessionId : ${client.sessionId}, userId : ${client.userId}`)

        const player = new Player();
        player.sessionId = client.sessionId;

        if (client.hashCode) {
            player.zepetoHash = client.hashCode;
        }
        if (client.userId) {
            player.zepetoUserId = client.userId;
        }
        const storage: DataStorage = client.loadDataStorage();

        let visit_cnt = await storage.get("VisitCount") as number;
        if (visit_cnt == null) visit_cnt = 0;

        console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)
        await storage.set("VisitCount", ++visit_cnt);

        this.state.players.set(client.sessionId, player);
    }

    onTick(deltaTime: number): void {
        //  It is repeatedly called at each set time in the server, and a certain interval event can be managed using deltaTime.
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {
        this.state.players.delete(client.sessionId);
    }
}