import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Button } from 'UnityEngine.UI';
import { Animator, AnimationClip } from 'UnityEngine';
import { SpawnInfo, ZepetoPlayers, LocalPlayer, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { WorldService } from 'ZEPETO.World';

export default class CharacterController extends ZepetoScriptBehaviour {

    public customAnimationClip: AnimationClip;
    public playCustomAnimationButton: Button;
    public playCustomAnimationButton2: Button;
    public playCustomAnimationButton3: Button;
    private _localPlayerAnimator: Animator;

    Start() {

        this.playCustomAnimationButton.onClick.AddListener(() => {
            this._localPlayerAnimator.SetBool("isCrouch", !this._localPlayerAnimator.GetBool("isCrouch"));
        })
        this.playCustomAnimationButton2.onClick.AddListener(() => {
            this._localPlayerAnimator.SetTrigger("Attack");
            this._localPlayerAnimator.CrossFade("Attack", 1, 1, 0.1);
        })
        this.playCustomAnimationButton3.onClick.AddListener(() => {
            this._localPlayerAnimator.SetTrigger("BeCatched");
            this._localPlayerAnimator.SetBool("isZombie", true);
        })

        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            const player: LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
            this._localPlayerAnimator = player.zepetoPlayer.character.GetComponentInChildren<Animator>();
        });
        
    }


}