const CLIENT_ID = "1476089479709069426";
const MY_DOMAIN = "https://bearmanentp.github.io/Survey-on-Ulsan-Bus-Driving-Simulator-Events"; // 끝에 / 넣지 않기
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyuKTi9cwXjL0vF7Sul4GDsV9IPgB-bkz_OdpZXuh0AAd02oGQQfK7_cGhOEEEr1qIq5Q/exec";

let currentUserData = null;

window.onload = async () => {
  const code = new URLSearchParams(location.search).get("code");
  
  // 접속 시 인증 코드가 없으면 즉시 디스코드 로그인 페이지로 자동 이동
  if (!code) {
    return loginWithDiscord();
  }

  try {
    const res = await fetch(`${GAS_API_URL}?action=getDiscordUser&code=${code}&redirect_uri=${encodeURIComponent(MY_DOMAIN)}`);
    const data = await res.json();

    if (data.status === "success") {
      currentUserData = data.user;
      document.getElementById("display-nickname").innerText = currentUserData.serverNickname;
      document.getElementById("display-username").innerText = `@${currentUserData.username}`;
      showSection("section-form");
    } else {
      alert("디스코드 인증 실패: " + (data.error || "오류"));
      loginWithDiscord();
    }
  } catch (err) {
    alert("통신 오류: " + err.message);
    loginWithDiscord();
  }
};

function loginWithDiscord() {
  location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(MY_DOMAIN)}&response_type=code&scope=identify%20email%20guilds.members.read`;
}

async function submitData(e) {
  e.preventDefault();

  const robloxInput = document.getElementById("robloxName").value.trim();
  const robloxRegex = /^[a-zA-Z0-9_]{3,20}$/;

  // 로블록스 영어 아이디 검증 (영문, 숫자, 언더바만 허용, 3~20자)
  if (!robloxRegex.test(robloxInput)) {
    alert("로블록스 아이디는 영문, 숫자, 언더바(_)만 사용하여 3~20자로 입력하셔야 합니다.\n(표시 이름/디스플레이 네임이 아닌 계정 ID를 입력해주세요)");
    return;
  }

  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  btn.innerText = "제출 중...";

  try {
    await fetch(GAS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submitForm",
        discordId: currentUserData.id,
        username: currentUserData.username,
        serverNickname: currentUserData.serverNickname,
        robloxName: robloxInput,
        content: document.getElementById("content").value
      })
    });
    alert("성공적으로 제출되었습니다!");
    location.href = MY_DOMAIN;
  } catch (err) {
    alert("제출 실패: " + err.message);
    btn.disabled = false;
    btn.innerText = "제출하기";
  }
}

function showSection(id) {
  ["section-login", "section-loading", "section-form"].forEach(s => document.getElementById(s).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}
