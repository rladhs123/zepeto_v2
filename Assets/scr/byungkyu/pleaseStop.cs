using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class pleaseStop : MonoBehaviour
{
   private Rigidbody rigidbody;

    private void Start()
    {
        // Rigidbody 컴포넌트에 대한 참조 가져오기
        rigidbody = GetComponent<Rigidbody>();
    }

    // 애니메이션 이벤트로부터 호출될 함수
    public void DisableCharacterMovement()
    {
        // 캐릭터의 이동을 막기 위한 로직을 추가합니다.
        // 예: Rigidbody의 이동을 막습니다.
        if (rigidbody != null)
        {
            rigidbody.velocity = Vector3.zero;
            rigidbody.angularVelocity = Vector3.zero;
        }
    }
}
