using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class buttonManager : MonoBehaviour
{
    public Sprite[] crouchSprites;
    public bool isCrouchClicked;
    public Button crouchButton;

    public void CrouchButtonClick(){
        isCrouchClicked = !isCrouchClicked;
        if(this.isCrouchClicked) crouchButton.GetComponent<Image>().sprite = crouchSprites[0];
        else crouchButton.GetComponent<Image>().sprite = crouchSprites[1];
    }

}
