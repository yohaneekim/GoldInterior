const form = document.getElementById("contact-form");

      form.addEventListener("submit", async function (e) {
        // 기본 이동 동작 중지
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerText;

        // 버튼 클릭 중 중복 전송 방지
        submitButton.disabled = true;
        submitButton.innerText = "전송 중...";

        const formData = new FormData(form);

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          });

          if (response.ok) {
            // 전송 완료 Alert 팝업
            alert(
              "소중한 견적 문의가 정상적으로 접수되었습니다.\n확인 후 24시간 이내에 연락드리겠습니다.",
            );

            // OK 클릭 시 입력 폼 전체 초기화
            form.reset();
          } else {
            alert("전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
          }
        } catch (error) {
          alert(
            "네트워크 오류가 발생했습니다. 인터넷 연결 상태를 확인해 주세요.",
          );
        } finally {
          // 버튼 원복
          submitButton.disabled = false;
          submitButton.innerText = originalText;
        }
      });
