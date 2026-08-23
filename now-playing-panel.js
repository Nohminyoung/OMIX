/* =====================================================
   OMIX — now-playing-panel.js
   글로벌 Now Playing 패널 (전 페이지 공통)
   - 미니 플레이어에 "상세보기" 버튼 자동 주입
   - 슬라이드업 패널: 좌=LP레코드 고정 / 우=탭(가사·플리·최근·좋아요·인기)
   ===================================================== */

(function () {

  /* ── 트랙 데이터 ── */
  const TRACKS = [
    { title: 'Void Mandala',     artist: 'DJ Haein × OMIX',    duration: '3:48', genre: 'AMBIENT',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `공(空) 속에서 피어나는\n만다라의 울림\n텅 빈 그 중심에서\n모든 것이 시작된다\n\n비워야 채워지고\n버려야 얻어진다\n그 역설의 진리\n선율로 흐른다\n\n아무것도 없는 곳에서\n모든 것을 듣는다` },
    { title: '108 Bells',        artist: 'Zen Kollective',      duration: '4:21', genre: 'RITUAL',    label: 'OMIX.LP.01', year: '2025',
      lyrics: `백팔 번의 울림\n백팔 가지의 번뇌\n종소리 따라\n하나씩 내려놓는다\n\n새벽 예불의 정적\n공명하는 법당\n찰나의 깨달음\n종소리 속에 있다` },
    { title: 'Lotus Drop',       artist: 'Haein',               duration: '3:12', genre: 'NEO-SOUL',  label: 'OMIX.LP.01', year: '2025',
      lyrics: `진흙 속에서 피어나\n물 위에 떠오른 꽃\n더러움에 물들지 않고\n청정하게 빛난다\n\n연꽃처럼\n그렇게 살고 싶다` },
    { title: 'Temple Rave',      artist: 'OMIX Collective',     duration: '5:44', genre: 'TECHNO',    label: 'OMIX.LP.01', year: '2025',
      lyrics: `법고 소리 베이스로\n목탁이 킥이 되고\n염불이 랩이 된다\n\n천 년의 전통\n오늘 밤 클럽에서\n다시 태어난다\n\n모두가 하나 되는\n이 순간의 선정` },
    { title: 'Samsara Loop',     artist: 'DJ Haein',            duration: '6:02', genre: 'DEEP TECH', label: 'OMIX.LP.01', year: '2025',
      lyrics: `윤회의 고리 속\n반복되는 선율\n그 안에서 찾는\n해탈의 출구\n\n루프는 끝나지 않는다\n의식이 깨어날 때까지` },
    { title: 'Dharma Wave',      artist: 'Zen Kollective',      duration: '4:55', genre: 'WAVE',      label: 'OMIX.LP.01', year: '2025',
      lyrics: `법의 파도가 온다\n온몸으로 맞이하라\n휩쓸리지 말고\n파도 위에 서라\n\n세상의 이치\n음악으로 흐른다` },
    { title: 'Nirvana Bass',     artist: 'OMIX Studio',         duration: '3:33', genre: 'BASS',      label: 'OMIX.LP.01', year: '2025',
      lyrics: `열반의 고요함\n베이스 라인으로\n가슴 속 깊이\n울려 퍼진다\n\n집착을 놓아버릴 때\n진정한 자유가 온다` },
    { title: 'Koan Dub',         artist: 'Haein',               duration: '7:11', genre: 'DUB',       label: 'OMIX.LP.01', year: '2025',
      lyrics: `한 손으로 치는 소리는?\n그 물음 속에\n답이 있다\n\n더브의 공간 속\n메아리 치는 화두\n에코가 진리다` },
    { title: 'Bodhi Frequency',  artist: 'OMIX Collective',     duration: '5:18', genre: 'AMBIENT',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `보리수 아래\n깨달음의 주파수\n432Hz로 맞춰진\n우주의 소리\n\n몸이 공명한다\n마음이 열린다` },
    { title: 'Mantra Machine',   artist: 'DJ Haein × Haein',   duration: '4:44', genre: 'INDUSTRIAL',label: 'OMIX.LP.01', year: '2025',
      lyrics: `옴 마니 반메 훔\n기계의 리듬으로\n반복되는 진언\n\n만트라는 기도\n기계는 수행\n그 경계가 없어질 때` },
    { title: 'Silent Thunder',   artist: 'DJ Haein × OMIX Studio', duration: '2:46', genre: 'CLUB',   label: 'OMIX.LP.01', year: '2025',
      lyrics: `천둥소리 없는\n번개의 빛\n말 없이 이해하는\n선의 언어\n\n침묵이 가장 큰 소리\n그 안에 모든 것` },
    { title: 'Return to Zero',   artist: 'OMIX Studio',         duration: '8:08', genre: 'DRONE',     label: 'OMIX.LP.01', year: '2025',
      lyrics: `제로로 돌아간다\n처음으로 돌아간다\n모든 것의 시작\n공(空)으로\n\n끝은 시작이고\n시작은 끝이다\n원으로 완성되는\nOMIX의 여정` },

    /* ── 직접 업로드한 곡들 — 가사는 lyrics: 뒤에 채워 넣으세요 (줄바꿈은 \n) ── */
    { title: 'Dharma Lights',        artist: 'DJ Haein × OMIX Studio', duration: '1:55', genre: 'DANCE',      label: 'OMIX.LP.02', year: '2025',
      lyrics: `(가사를 여기에 입력하세요)` },
    { title: 'Han Groove Riot',      artist: 'OMIX Studio',            duration: '2:57', genre: 'DANCE',      label: 'OMIX.LP.02', year: '2025',
      lyrics: `(가사를 여기에 입력하세요)` },
    { title: 'Karma Game',           artist: 'OMIX Studio',            duration: '5:00', genre: 'ELECTRONIC', label: 'OMIX.LP.02', year: '2025',
      lyrics: `One choice, one life
돌고 도는 karma line
눈을 감아도 들려와
내 안에서 울린 sign

화려하게 빛난 도시
그 아래 숨은 나의 탐욕
더 가지면 닿을 것 같아
끝이 없는 손을 뻗어

승리라는 이름 뒤에
더 큰 갈증만 남아
잡으려 할수록 모든 건
손가락 사이로 흩어져 가

어제 내가 던진 말은
오늘 다시 나를 향해
피할 수 없는 발자국처럼
내 뒤를 따라오네

하나씩 뒤집히는 card
숨길 수 없는 나의 karma
우연이라 믿었던 순간도
모두 이어진 인연

끝없이 달려온 이유
내가 원한 것은 무엇인가
마지막 패를 내려놓고
이제 나를 바라봐

This is my karma game
내가 만든 길을 걸어
욕망과 두려움까지
모두 나로부터 온 것

This is my karma game
더 이상 피하지 않아
얻고 잃는 모든 순간은
잠시 머물다 갈 뿐

Let it go, let it fade
쥐고 있던 손을 펴
돌고 돌아 마주한 건
결국 내 마음이니까

This is my karma game
이제 눈을 뜨는 밤
(hey) (wake up)

Round and round
업은 다시 돌아와
Down and down
번뇌 깊이 떨어져도

One more breath
고요 속에 나를 봐
백팔 번의 흔들림 끝에
I wake up now

누군가를 이기기 위해
나 자신을 잃어버렸고
욕심으로 세운 왕좌는
한순간에 무너져 내려

영원할 것 같던 이름
영원할 것 같던 사랑
피고 지는 꽃잎처럼
모든 것은 변해 가

멀어지는 너를 보며
붙잡는 게 사랑인 줄 알았어
하지만 진짜 인연이라면
놓아줘도 남아 있겠지

Stack it up, 더 높이 쌓아
욕망 위에 세운 나의 tower
손에 넣을수록 마음은 hollow
끝을 향해 달려가는 shadow

내가 뿌린 말과 행동
시간을 넘어 다시 돌아와
누굴 탓해, 답은 내 안에
원인 없는 결과는 없잖아

미움은 미움을 낳고
상처는 또 상처를 남겨
이 고리를 끊을 사람은
바로 지금 여기의 나

숨을 들이쉬고 내쉬어
지나간 나를 놓아줘
모든 것은 머물지 않아
That’s the truth I know
(yeah) (shh)

하나씩 무너지는 wall
가면 뒤의 나를 만나
정답이라 믿었던 것들도
시간 앞에서는 무상해

끝없이 헤매던 이유
내 마음을 보지 못한 채
세상을 바꾸려 했던 나는
이제 나를 바꿔 가

This is my karma game
내가 만든 길을 걸어
욕망과 두려움까지
모두 나로부터 온 것

This is my karma game
더 이상 피하지 않아
얻고 잃는 모든 순간은
잠시 머물다 갈 뿐

Let it go, let it fade
쥐고 있던 손을 펴
돌고 돌아 마주한 건
결국 내 마음이니까

This is my karma game
이제 눈을 뜨는 밤
(hey) (wake up)

들끓던 소리가 멎으면
비로소 들리는 숨결
세상이 나를 흔든 게 아니라
내 마음이 흔들린 거야

좋고 나쁜 이름을 내려놔
있는 그대로 바라봐
어둠 또한 빛을 만나기 위한
또 하나의 길이니까

너와 내가 만난 것도
스쳐 갈 우연은 아니야
서로의 삶에 남긴 파문이
다음 생의 길이 될 테니

Karma, karma
돌아오는 answer
Dharma, dharma
마음속의 mirror

Three, two, one
Burn the greed
백팔 번뇌를 넘어
Set me free

This is my karma game
내가 만든 길을 넘어
후회와 미움까지도
이제 품고 걸어가

This is my karma game
승리보다 중요한 건
누군가를 쓰러뜨리는 게 아닌
어제의 나를 놓는 것

Let it go, let it fade
비워진 두 손을 펴
아무것도 가지지 않아도
나는 사라지지 않아

This is my karma game
이제 다시 시작해
(oh) (yeah)

One breath, one life
지금 여기, present time
끝이라 믿었던 이 밤은
새로운 나의 sunrise

돌고 도는 karma line
모든 인연을 지나
마지막에 마주한 진실
The answer was inside` },
    { title: 'Mix Attack',           artist: 'OMIX Studio',            duration: '2:56', genre: 'CLUB',       label: 'OMIX.LP.02', year: '2025',
      lyrics: `Ooh, turn it up
하나둘 깨어나는 sound
You and I, we mix it now
새로운 파도가 번져가

조용했던 나의 하루에
낯선 리듬이 내려앉아
손끝으로 너를 누르면
작은 떨림이 커져가

알 수 없는 이끌림 따라
서로 다른 맘이 겹쳐져
흩어졌던 모든 순간이
오늘 하나의 노래가 돼

조금 더 가까이
박자를 맞춰 봐
멈추지 마, 이 느낌
우리만의 sign

점점 더 선명히
번지는 melody
지금 이 순간을
놓치고 싶지 않아

Mix, mix, mix it up
심장이 뛰는 대로
빛, 빛, 빛이 나
너와 나의 rhythm

Hit, hit, hit the sound
세상을 깨울 정도로
서로 다른 우리도
하나가 되는 순간

Mix attack, mix attack
내 맘을 두드려
Mix attack, mix attack
더 크게 울려 퍼져

Hey, hit the beat
One, two, three, four
Mix it up
Give me one more

빠르게 번지는 vibration
정답은 필요하지 않아
조금 서툰 너의 박자도
우리 음악에선 완벽해

붉게 물든 조명 아래
감춰왔던 맘을 꺼내 봐
백팔 초의 짧은 순간이
오래 남을 기억이 돼

조금 더 가까이
박자를 맞춰 봐
멈추지 마, 이 느낌
우리만의 sign

점점 더 뜨겁게
차오른 energy
지금 네 손끝에
새로운 길이 열려

Mix, mix, mix it up
심장이 뛰는 대로
빛, 빛, 빛이 나
너와 나의 rhythm

Hit, hit, hit the sound
세상을 깨울 정도로
서로 다른 우리도
하나가 되는 순간

Mix attack, mix attack
내 맘을 두드려
Mix attack, mix attack
더 크게 울려 퍼져

You make the sound
I make the light
서로의 순간을 섞어 tonight

You make the sound
We make it right
끝나지 않을 우리들의 mix` },
    { title: 'No Score, Just Soul',  artist: 'OMIX Studio',            duration: '5:01', genre: 'HEALING',    label: 'OMIX.LP.02', year: '2025',
      lyrics: `No tally, no trophy
No price on the love
If it leaves your hands lighter
Then it’s already enough

One, two
Let it move

I used to keep count like a clerk in a suit
Every “thank you” owed me a little salute
But love with a ledger gets heavy to hold
So I tore out the pages and loosened my soul

No name on the kindness, no claim on the light
No need for a witness to say I was right
Just a hand in the dark when the whole street froze
The finest kind of giving is the giving that goes

[Pre-Chorus: rising backing vocals]

Open hands, open door
What goes out can become much more
No spotlight, no parade
Goodness grows when the name tag fades

No score, just soul
Let the good thing roll
Give it clean, give it true
Let the love come dancing through

No score, no crown
Lift somebody off the ground
When the rhythm comes around
You won’t own the glow
But you’ll feel that sound

[Post-Chorus: call and response]

Give it
Let it go

That’s the only way it grows

No score
Just soul

Let the good love roll

Coffee for a stranger, room for a friend
A coat in the rain when the long day won’t end
You don’t need a fortune to open a way
Sometimes grace is five good minutes in a hard day

No favor in a cage, no ribbon on the deed
No “remember what I did” hiding in the seed
Plant it where you stand, let the whole thing flow
Kindness is a river, not a thing that you own

[Pre-Chorus 2: brighter harmony]

Open eyes, open palms
Little acts keep traveling on
No receipt, no return
Pass the light and let it burn

[Chorus: full groove, higher vocal energy]

No score, just soul
Let the good thing roll
Give it clean, give it true
Let the love come dancing through

No score, no crown
Lift somebody off the ground
When the rhythm comes around
You won’t own the glow
But you’ll feel that sound

Hey
No receipt
No return
Come on

[Bridge: half-time soul section]

If I give just to get
That’s a bargain, not grace
If I love just for praise
I put a mirror in your place

So I step out the frame
Let the moment stay yours
Let the good leave my hands
And unlock other doors

No halo to polish
No debt to collect
No name in the credits
No check after check

What I lose in applause
I gain in release
When the hand lets go
The heart keeps the beat

No receipt!
(Let it go!)

No spotlight!
(Let it glow!)

Open hands!
(Open wide!)

Soul in motion!
(Side to side!)

No receipt!
(Let it go!)

No spotlight!
(Let it glow!)

Give it free!
(Give it true!)

Let the good come dancing through!

No score, just soul
Let the whole world roll
Give it clean, give it true
Let a little mercy move through you

No score, no crown
Lift somebody off the ground
When the rhythm comes around
You won’t own the glow
But you’ll feel that sound

No score, just soul
Let the good thing roll
What you give can travel on
Long after you are gone

No score, no crown
Pass that golden feeling down
When the rhythm comes around
You won’t own the glow
But you’ll feel that sound

No tally
No trophy

No claim
No control

Open hands
Open heart

No score
Just soul

No score

Just soul` },
    { title: 'Temple Echo Loop',     artist: 'OMIX Studio',            duration: '4:09', genre: 'AMBIENT',    label: 'OMIX.LP.02', year: '2025',
      lyrics: `(가사를 여기에 입력하세요)` },
    { title: '공즉',                 artist: 'OMIX Studio',            duration: '2:53', genre: 'MEDITATION', label: 'OMIX.LP.02', year: '2025',
      lyrics: `(OMIX

오옴, 이건 내 이름보다 먼저 울린 sound
종이에 적기 전에 퍼져버린 cloud
내가 뱉는 한 줄, 그게 바로 법문
마이크 앞에 앉아도 자세는 합장 mode

눈 반쯤 감았다가 떠도 이미 봤지
번뇌들은 몰려와도 결국엔 다 잡지
여기가 사바인지 무대인지 몰라
근데 bass가 울리면 중생들도 올라

백이면 백이고 공이면 공이지
색즉시공이면 flex도 비워야 폼이지
목탁은 tick 하고 hi-hat은 trip
내 마음은 비웠는데 존재감은 thick

Hip hop인 게 무슨 왕관인 양
얹어도 무거우면 내려놔 그냥
예의는 안 맞춰도 박자는 맞춰
번뇌는 벗겨내고 진짜만 갖춰

오옴, 숨 한번 들이마셔
잡생각들은 전부 뒤로 밀어놔서
내 flow는 만다라, 돌고 돌아도 중심
겉으론 고요해도 안에서는 지진

오옴, let it breathe, let it bounce
목탁 위에 올라타, count by count
비워낸 만큼 더 크게 울려
OMIX sound, we go higher

Karma in my pocket, I don’t need a chain
비 맞아도 연꽃처럼 피어나 again
누가 나를 판단해, 그건 너의 업
나는 내 길 걸어, step by step, what

법고가 울려, 둥 둥 둥
심장도 따라와, boom boom boom
불빛은 연등처럼 위로 뜨고
내 가사는 향처럼 공기 속에 묻고

나는 안 빌어, 그냥 믿어
내 안의 소리를 더 크게 키워
넘어진 자리도 수행의 일부
상처는 scar 아냐, 다음 verse의 문구

말은 씨가 돼, 그래서 조심히 뿌려
근데 beat 위에선 거침없이 굴려
칼보다 날카로운 건 비운 혀끝
욕심을 덜어내니 더 세지는 breath

비워, 비워, 근데 내 존재감은 heavy
고요 속에 thunder, mind so steady
만다라처럼 돌아도 길은 안 잃어
내 안의 소리로 다시 나를 일으켜

오옴, 숨 한번 들이마셔
잡생각들은 전부 뒤로 밀어놔서
내 flow는 만다라, 돌고 돌아도 중심
겉으론 고요해도 안에서는 지진

오옴, let it breathe, let it bounce
목탁 위에 올라타, count by count
비워낸 만큼 더 크게 울려
OMIX sound, we go higher

오오오옴—
공즉 flow
OMIX)` },
    { title: '무명등',               artist: 'OMIX Studio',            duration: '2:55', genre: 'MINDFUL',    label: 'OMIX.LP.02', year: '2025',
      lyrics: `OMIX
yeah

무명 속에 서 있지 난, 불을 잃은 등
내가 원한 빛은 왜 날 태워버린 듯
업은 돌아오지, 말없이 내 품
돌아가고 싶어도 길은 닫힌 문

I was lost in my karma, 깊어지는 밤
내가 잡은 것들은 전부 흩어진 향
무명 속에 서 있지 난, 불을 잃은 등
그래도 널 비추고 싶었어 한 번쯤

너무 멀리 와버린 뒤에야 알아
손에 쥔 게 많아도 마음은 말라
폰은 꺼놔, 소문은 바람이라
듣고 싶지 않아, 내 안이 더 시끄러워 지금

Why am I floating, tell me where to land
기도는 못 해도 두 손은 모은 채
백 개의 욕심이 내 목을 감을 때
한 번의 종소리가 나를 다시 부르네

내 목걸인 빛났지만 목은 더 차가워
가진 게 많을수록 잠은 더 가벼워
꿈속의 계단은 끝없이 갈라져
올라간 줄 알았는데 난 계속 가라앉어

틱탁, 시침 소리만 방 안에 남아
숨 쉬는 법도 잊은 것 같아
연꽃은 진흙에서 핀다는데
나는 왜 진흙만 끌어안아

무명 속에 서 있지 난, 불을 잃은 등
내가 원한 빛은 왜 날 태워버린 듯
업은 돌아오지, 말없이 내 품
돌아가고 싶어도 길은 닫힌 문

I was lost in my karma, 깊어지는 밤
내가 잡은 것들은 전부 흩어진 향
무명 속에 서 있지 난, 불을 잃은 등
그래도 널 비추고 싶었어 한 번쯤

죄인이 된 것처럼 서 있었지 그대로
후회는 등 뒤에서 따라왔지 발소리로
너를 지킨다며 내가 만든 그늘
이제 보니 나였지, 제일 차가운 구름

Please forgive me for my blind mind
I was chasing gold in the wrong life
너에게 주려던 세상은 커졌는데
정작 네가 쉴 곳 하나 만들지 못했네

반야를 말해도 난 집착에 묶여
공하다 말해도 네 이름에 무너져
비워야 산다는데 비우면 네가 없어질까
그래서 난 아직도 이 어둠을 못 꺼

돌아, 돌아, 윤회처럼 돌아
같은 꿈을 또 꾸고 같은 이름을 불러
타오르던 초는 점점 짧아지고
말 못 한 마음만 길게 남아 흘러

If I meet you in another life
그땐 욕심 말고 빛으로 갈게
If I lose you in another night
그땐 붙잡지 않고 기도로 남을게

무명 속에 서 있지 난, 불을 잃은 등
내가 원한 빛은 왜 날 태워버린 듯
업은 돌아오지, 말없이 내 품
돌아가고 싶어도 길은 닫힌 문

I was lost in my karma, 깊어지는 밤
내가 잡은 것들은 전부 흩어진 향
무명 속에 서 있지 난, 불을 잃은 등
그래도 널 비추고 싶었어 한 번쯤

무명 속에 남은 등
언젠간 꺼지겠지
아니면 다시 피겠지
OMIX` },
    { title: '사계윤회',             artist: 'OMIX Studio',            duration: '2:30', genre: 'WORLD',      label: 'OMIX.LP.02', year: '2025',
      lyrics: `OMIX
계절은 또 돌아오네

봄이 와도 내 맘엔 아직 겨울이네
피운 줄 알았던 꽃잎은 재가 되네
붙잡은 인연은 업처럼 돌아오네
놓아야 산다는데 난 또 너를 부르네

사계는 돌아, 나는 제자리
해가 떠도 마음 안은 아직 밤이
비워낸 줄 알았던 이름 하나가
다시 향처럼 번져 내 방 안까지

젖은 새벽 끝에 종이 울려 멀리
잠을 잃은 눈엔 달빛마저 버겁지
괜찮다 말하는 입술은 얼어붙고
기도도 못 한 손은 주머니에 숨었지

나는 많은 걸 원했고 많은 걸 잃었네
가진 것들 사이에서 나를 더 비웠네
빛을 따라간 줄 알았던 내 발걸음
그림자만 길어져 날 다시 덮었네

무상하다 배웠는데 왜 난 매번 놀라
사라지는 것 앞에서 또 마음을 골라
꽃은 지는 법을 알아서 아름다운데
나는 지는 법을 몰라서 계속 아프네

틱, 탁, 목탁 소리
내 시간은 또 제자리
숨, 한 번 들이쉬고
널 보내는 법을 배우지

봄이 와도 내 맘엔 아직 겨울이네
피운 줄 알았던 꽃잎은 재가 되네
붙잡은 인연은 업처럼 돌아오네
놓아야 산다는데 난 또 너를 부르네

사계는 돌아, 나는 제자리
해가 떠도 마음 안은 아직 밤이
비워낸 줄 알았던 이름 하나가
다시 향처럼 번져 내 방 안까지

여름은 뜨거웠고 말들은 데였네
가을엔 떨어진 잎처럼 우리도 헤졌네
겨울엔 침묵만 두꺼워져 이불처럼
덮어도 추웠지, 미안하단 말 뒤로

윤회처럼 같은 꿈을 다시 꿔
깨어나도 베개 위엔 네 이름이 젖어
잊었다 믿은 순간마다 돌아와
나를 시험하듯 조용히 앉아

욕심은 사랑의 다른 얼굴 같아
지켜준단 말로 너를 가둔 것 같아
이제야 알아, 빛이 되고 싶던 내가
때로는 너에게 가장 긴 밤이었다는 걸

초 하나 켜놓고 내 마음을 봐
타오르는 건 빛인지 미련일까
향 하나 피우고 내 이름을 놔
남는 것은 연기인지 기도일까

If I see you in another life
그땐 손보다 먼저 마음을 비울게
If the seasons bring you back
그땐 사랑보다 평안을 빌게

봄이 와도 내 맘엔 아직 겨울이네
피운 줄 알았던 꽃잎은 재가 되네
붙잡은 인연은 업처럼 돌아오네
놓아야 산다는데 난 또 너를 부르네

사계는 돌아, 나는 제자리
해가 떠도 마음 안은 아직 밤이
비워낸 줄 알았던 이름 하나가
다시 향처럼 번져 내 방 안까지

계절은 다시 오고
나는 조금 비워지고
너는 멀어져도
기도처럼 남아` },
    { title: '업보 Bounce',          artist: 'OMIX Studio',            duration: '3:14', genre: 'DANCE',      label: 'OMIX.LP.02', year: '2025',
      lyrics: `OMIX
Yeah
업보는 돌아와, bounce
업보는 돌아와, 빙빙 like a wheel
내 말은 향처럼 남아, you can feel
목탁은 딱딱, bass는 boom boom
사바세계 위에 깔아놓은 groove

옴, 근데 난 조용하지 않아
비운 만큼 더 크게 올라가잖아
숨 한번 고르고 판을 갈아
OMIX, 소리로 문을 열어놔

내 이름 묻지 마, vibe로 먼저 통과
말보다 빠르게 퍼져, 향 냄새보다 독한
느낌으로 입장, 박자 위에 합장
겉으론 장난, 속으론 수행하는 각자

누가 뭐라 해도 난 안 흔들려, 법당
발밑에 808 깔리면 바로 낙장
불입문 앞에서 attitude check
비워낸 척하는 애들 주머니엔 욕심 stack

나는 필요 없는 말들 싹 다 소각
재가 된 생각 위에 새로 적어 조각
연등처럼 켜져, 내 verse는 야간 개장
중생들 다 깨워, 여긴 새벽 예불 현장

말투는 툭, 근데 뜻은 깊게
웃으면서 던져도 꽂히지 쉽게
농담 반, 진담 반, 반야처럼 split
한 줄로 네 번뇌를 flip, flip, flip

돌아, 돌아, 법륜처럼 돌아
막힌 마음 위로 beat가 쏟아
비워, 비워, 근데 존재감은 올라
종소리 한 번에 분위기는 overload

업보는 돌아와, 빙빙 like a wheel
내 말은 향처럼 남아, you can feel
목탁은 딱딱, bass는 boom boom
사바세계 위에 깔아놓은 groove

옴, 근데 난 조용하지 않아
비운 만큼 더 크게 올라가잖아
숨 한번 고르고 판을 갈아
OMIX, 소리로 문을 열어놔

색은 공이라며 왜 넌 색만 골라
겉멋만 가득 차서 속은 텅 빈 cola
나는 빈 그릇, 그래서 더 담아
소리 하나 얹으면 전시장도 법당

108번뇌? 난 108 bars
하나씩 털어내고 올라타는 stars
말끝마다 딸려오는 karma receipt
뱉은 대로 돌아오니 조심해 your speech

허세는 무거워서 춤을 못 춰
나는 가벼워져서 더 멀리 뻗쳐
발은 땅에 붙고 머리는 cloud
묵언수행 중인데도 소문은 loud

누가 왕관 얘기해, 난 삭발한 crown
높아질수록 낮게 깔리는 sound
연꽃은 진흙에서 피는 법
그래서 난 어두워도 빛을 써

딱, 딱, 목탁 치듯 count it
둥, 둥, 법고처럼 pounding
숨, 숨, 고요 안에 bouncing
OMIX, we keep it sounding

업보는 돌아와, 빙빙 like a wheel
내 말은 향처럼 남아, you can feel
목탁은 딱딱, bass는 boom boom
사바세계 위에 깔아놓은 groove

옴, 근데 난 조용하지 않아
비운 만큼 더 크게 올라가잖아
숨 한번 고르고 판을 갈아
OMIX, 소리로 문을 열어놔

업보는 돌아와
소리는 남아
OMIX` },
    { title: '파도에 맡겨',          artist: 'OMIX Studio',            duration: '4:09', genre: 'HEALING',    label: 'OMIX.LP.02', year: '2025',
      lyrics: `Oh, ride the wave
저 멀리 펼쳐진 blue
오늘만큼은 아무 생각 없이
우리 마음 가는 대로

뜨거운 햇살 아래
모래 위를 달려가
어제의 걱정들은
파도 뒤로 흘려놔

끝없이 밀려왔다
조용히 멀어지는 물결
붙잡으려 했던 마음도
이젠 보내줘도 괜찮아

스쳐 가는 바람처럼
모든 건 잠시 머물 뿐
지금 네가 웃고 있다면
그걸로 충분한 걸

두 손 가득 쥐었던
무거운 마음을 펼쳐
하나둘 내려놓으면
세상이 더 넓어 보여

파도에 맡겨, 맡겨
우리 마음 가는 대로
푸른 하늘 끝까지
더 자유롭게 날아

오늘을 느껴, 느껴
다시 오지 않을 순간
우연처럼 만난 우리도
소중한 인연이니까

Hey, 걱정은 멀리
Hey, 바람을 따라
비워낸 마음 위에
새로운 여름이 피어나

La-la-la, ride the wave
La-la-la, let it go
La-la-la, 지금 여기
우리 함께라면 paradise


수많은 생각들이
머릿속을 채우다가
네가 내 이름 부르면
거짓말처럼 사라져 가

조금 다른 걸음도
결국 같은 바다로 흘러
서로 다른 우리 소리가
하나의 노래가 되어

복잡한 마음은 잠깐 내려놔
어차피 구름처럼 흘러가
빠르게 달리지 않아도 돼
오늘의 발끝에 길이 생겨

정답을 찾느라 놓쳤던 view
고개를 들면 온 세상이 blue
만남도 이별도 물결처럼
왔다가 가도 의미가 있어

눈앞의 이 순간을
온전히 바라봐 줄래
멀리 있는 행복보다
네 웃음이 더 선명해

계속 변하는 계절도
두려워할 필요 없어
지는 해가 사라진 뒤엔
또 다른 빛이 찾아와

파도에 맡겨, 맡겨
우리 마음 가는 대로
푸른 하늘 끝까지
더 자유롭게 날아

오늘을 느껴, 느껴
다시 오지 않을 순간
우연처럼 만난 우리도
소중한 인연이니까

Hey, 걱정은 멀리
Hey, 바람을 따라
비워낸 마음 위에
새로운 여름이 피어나

멈춰 있던 마음에
잔잔한 종소리가 울려
지나간 날을 놓아주면
지금의 내가 들려

피고 지는 꽃처럼
우리도 변해가겠지만
함께 바라본 이 바다는
마음속에 남아 있을 거야

파도에 맡겨, 맡겨
더는 망설이지 말고
눈부신 수평선 너머
우리 꿈을 향해 날아

오늘을 느껴, 느껴
가장 빛나는 이 순간
수많은 세상 속 우리가
서로를 만난 이유니까

Hey, 걱정은 멀리
Hey, 바람을 따라
비워낸 마음속에
더 환한 여름이 피어나

La-la-la, ride the wave
La-la-la, let it go
흘러가는 모든 순간
그대로 아름다우니까

La-la-la, stay with me
La-la-la, here and now
오늘 우리 함께 만든
끝나지 않을 paradise` },
  ];

  /* chart.js 등 다른 스크립트에서 같은 가사 데이터를 재사용할 수 있도록 전역에 노출 */
  window.NP_TRACKS = TRACKS;

  /* 현재 트랙 인덱스 (글로벌) */
  let currentTrack = 0;

  /* 최근/좋아요/인기 곡 목록 — 곡 제목을 그대로 적으면 됩니다 (TRACKS의 title과 동일하게).
     위 TRACKS에 있는 곡이면 어떤 곡이든(직접 업로드한 곡 포함) 넣을 수 있습니다. */
  const RECENT  = ['108 Bells', 'Temple Rave', 'Void Mandala', 'Dharma Wave', 'Bodhi Frequency'];
  const LIKED   = ['Void Mandala', 'Lotus Drop', 'Nirvana Bass', 'Return to Zero'];
  const POPULAR = ['Void Mandala', 'Temple Rave', 'Koan Dub', '108 Bells', 'Samsara Loop', 'Mantra Machine'];

  /* ── HTML 주입 ── */
  const panelHTML = `
<div id="npPanel" class="np-panel" aria-hidden="true">
  <div class="np-backdrop"></div>
  <div class="np-sheet">

    <!-- 닫기 -->
    <button class="np-close" id="npClose" aria-label="닫기">✕</button>

    <div class="np-layout">

      <!-- ══ LEFT: LP 레코드 고정 ══ -->
      <div class="np-left">
        <div class="np-vinyl-wrap">
          <div class="np-vinyl" id="npVinyl">
            <!-- 그루브 링들 (CSS만) -->
            <div class="np-label" id="npLabel">
              <div class="np-label-brand">OMIX</div>
              <div class="np-label-title" id="npLabelTitle">Void Mandala</div>
              <div class="np-label-side">SIDE A</div>
              <div class="np-label-cat" id="npLabelCat">OMIX.LP.01</div>
              <div class="np-label-tracks" id="npLabelTracks">
                BLOOD · DNA · YAH · ELEMENT
              </div>
            </div>
          </div>
        </div>
        <div class="np-meta">
          <p class="np-meta-title" id="npMetaTitle">Void Mandala</p>
          <p class="np-meta-artist" id="npMetaArtist">DJ Haein × OMIX Studio</p>
          <p class="np-meta-tag" id="npMetaTag"><span class="np-genre-tag" id="npGenreTag">AMBIENT</span><span class="np-year" id="npYear">2025</span></p>
        </div>
        <!-- 미니 컨트롤 -->
        <div class="np-controls">
          <button class="np-ctrl" id="npPrev">⏮</button>
          <button class="np-ctrl np-ctrl-play" id="npPlay">▶</button>
          <button class="np-ctrl" id="npNext">⏭</button>
        </div>
        <div class="np-prog-wrap">
          <div class="np-prog-bar"><div class="np-prog-fill" id="npProgFill" style="width:38%"></div></div>
          <div class="np-prog-times"><span id="npCurTime">1:27</span><span id="npTotalTime">3:48</span></div>
        </div>
      </div>

      <!-- ══ RIGHT: 탭 콘텐츠 ══ -->
      <div class="np-right">
        <div class="np-tabs" role="tablist">
          <button class="np-tab active" data-tab="lyrics"   role="tab">가사</button>
          <button class="np-tab"        data-tab="playlist" role="tab">플레이리스트</button>
          <button class="np-tab"        data-tab="recent"   role="tab">최근 들은 곡</button>
          <button class="np-tab"        data-tab="liked"    role="tab">좋아요</button>
          <button class="np-tab"        data-tab="popular"  role="tab">많이 들은 곡</button>
        </div>

        <div class="np-pane-wrap">
          <!-- 가사 -->
          <div class="np-pane active" id="np-lyrics" role="tabpanel">
            <div class="np-lyrics-header">
              <span class="np-lyrics-track" id="npLyricsTrack">Void Mandala</span>
              <span class="np-lyrics-artist" id="npLyricsArtist">DJ Haein × OMIX Studio</span>
            </div>
            <pre class="np-lyrics-body" id="npLyricsBody"></pre>
          </div>

          <!-- 플레이리스트 -->
          <div class="np-pane" id="np-playlist" role="tabpanel">
            <p class="np-pane-label">OMIX.LP.01 — 전체 트랙</p>
            <ul class="np-track-list" id="npPlaylistList"></ul>
          </div>

          <!-- 최근 들은 곡 -->
          <div class="np-pane" id="np-recent" role="tabpanel">
            <p class="np-pane-label">최근 들은 곡</p>
            <ul class="np-track-list" id="npRecentList"></ul>
          </div>

          <!-- 좋아요 -->
          <div class="np-pane" id="np-liked" role="tabpanel">
            <p class="np-pane-label">좋아요한 곡</p>
            <ul class="np-track-list" id="npLikedList"></ul>
          </div>

          <!-- 많이 들은 곡 -->
          <div class="np-pane" id="np-popular" role="tabpanel">
            <p class="np-pane-label">많이 들은 곡</p>
            <ul class="np-track-list" id="npPopularList"></ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`;

  /* ── CSS 주입 ── */
  const css = `
/* ======================================================
   NOW PLAYING PANEL
   ====================================================== */
.np-panel {
  position: fixed; inset: 0; z-index: 9500;
  pointer-events: none;
}
.np-panel.open { pointer-events: all; }

.np-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0);
  transition: background 0.45s ease;
}
.np-panel.open .np-backdrop { background: rgba(0,0,0,0.85); }

.np-sheet {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: calc(100dvh - var(--player-h));
  background: #0e0e0d;
  border-top: 1px solid rgba(249,21,54,0.25);
  transform: translateY(100%);
  transition: transform 0.48s cubic-bezier(0.23,1,0.32,1);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.np-panel.open .np-sheet { transform: translateY(0); }

/* 닫기 버튼 */
.np-close {
  position: absolute; top: 20px; right: 24px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  color: #fff; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.np-close:hover { background: var(--red); }

/* ── 2단 레이아웃 ── */
.np-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: 100%;
  overflow: hidden;
}

/* ══ LEFT ══ */
.np-left {
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px 24px;
  gap: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #0e0e0d 0%, #120808 100%);
}

/* LP 바이닐 */
.np-vinyl-wrap {
  position: relative;
  width: min(260px, 60%);
  aspect-ratio: 1;
  flex-shrink: 0;
}

.np-vinyl {
  width: 100%; height: 100%;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%,
      #1a1a18 0px, #1a1a18 1px,
      #232320 1px, #232320 3px,
      #1c1c1a 3px, #1c1c1a 4px),
    radial-gradient(circle at 50% 50%, #111 0%, #0a0a09 100%);
  box-shadow:
    0 0 0 2px #111,
    0 0 0 4px #2a2a28,
    0 0 0 6px #111,
    0 24px 80px rgba(0,0,0,0.9);
  position: relative;
  animation: npVinylSpin 4s linear infinite paused;
}
.np-vinyl.spinning { animation-play-state: running; }

@keyframes npVinylSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* 중앙 라벨 */
.np-label {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 42%; aspect-ratio: 1;
  border-radius: 50%;
  background: var(--red);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 8px;
  overflow: hidden;
  counter-reset: none;
}
.np-label-brand {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 8px; font-weight: 900; letter-spacing: 0.15em;
  color: rgba(0,0,0,0.5);
  text-transform: uppercase;
}
.np-label-title {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 10px; font-weight: 900; letter-spacing: -0.02em;
  color: #000; line-height: 1.1;
  margin: 2px 0;
  max-width: 90%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.np-label-side {
  font-size: 7px; font-weight: 700; letter-spacing: 0.12em;
  color: rgba(0,0,0,0.6);
}
.np-label-cat {
  font-size: 6px; color: rgba(0,0,0,0.5);
  letter-spacing: 0.08em; margin-top: 1px;
}
.np-label-tracks {
  font-size: 5.5px; color: rgba(0,0,0,0.45);
  letter-spacing: 0.05em; margin-top: 2px;
  text-align: center; line-height: 1.4;
  max-width: 90%;
  overflow: hidden;
}

/* 메타 정보 */
.np-meta { text-align: center; }
.np-meta-title {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 18px; font-weight: 900;
  letter-spacing: -0.03em; color: #fff;
  margin-bottom: 4px;
}
.np-meta-artist {
  font-size: 12px; color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
}
.np-meta-tag { display: flex; align-items: center; gap: 8px; justify-content: center; }
.np-genre-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  padding: 2px 8px; border-radius: 2px;
  background: var(--red); color: #fff;
}
.np-year { font-size: 10px; color: rgba(255,255,255,0.3); }

/* 컨트롤 */
.np-controls {
  display: flex; align-items: center; gap: 16px;
}
.np-ctrl {
  color: rgba(255,255,255,0.5); font-size: 16px;
  padding: 8px; border-radius: 50%;
  transition: color 0.2s, background 0.2s;
  cursor: pointer;
}
.np-ctrl:hover { color: #fff; background: rgba(255,255,255,0.07); }
.np-ctrl-play {
  width: 44px; height: 44px; font-size: 18px;
  background: var(--red); color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.np-ctrl-play:hover { background: #c50f28; color: #fff; }

/* 프로그레스 */
.np-prog-wrap { width: 100%; }
.np-prog-bar {
  height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.1);
  cursor: pointer; position: relative;
}
.np-prog-fill {
  height: 100%; border-radius: 2px;
  background: var(--red);
  pointer-events: none;
}
.np-prog-times {
  display: flex; justify-content: space-between;
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin-top: 6px;
}

/* ══ RIGHT ══ */
.np-right {
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* 탭 바 */
.np-tabs {
  display: flex; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 28px;
  flex-shrink: 0;
}
.np-tab {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.35);
  padding: 20px 16px 18px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.np-tab:hover { color: rgba(255,255,255,0.7); }
.np-tab.active { color: #fff; border-bottom-color: var(--red); }

/* 패널 래퍼 */
.np-pane-wrap {
  flex: 1; overflow: hidden; position: relative;
}
.np-pane {
  display: none;
  height: 100%; overflow-y: auto;
  padding: 28px 32px 40px;
  scrollbar-width: thin;
  scrollbar-color: rgba(249,21,54,0.3) transparent;
}
.np-pane::-webkit-scrollbar { width: 4px; }
.np-pane::-webkit-scrollbar-thumb { background: rgba(249,21,54,0.3); border-radius: 2px; }
.np-pane.active { display: block; }

/* 가사 */
.np-lyrics-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.np-lyrics-track {
  display: block;
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: clamp(22px, 3vw, 36px); font-weight: 900;
  letter-spacing: -0.03em; color: #fff;
  margin-bottom: 4px;
}
.np-lyrics-artist {
  font-size: 13px; color: rgba(255,255,255,0.4);
}
.np-lyrics-body {
  font-family: var(--font, 'Montserrat', sans-serif);
  font-size: 15px; font-weight: 500;
  line-height: 2.2; color: rgba(255,255,255,0.75);
  white-space: pre-wrap;
  letter-spacing: 0.01em;
}

/* 섹션 라벨 */
.np-pane-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25); text-transform: uppercase;
  margin-bottom: 16px;
}

/* 트랙 목록 */
.np-track-list {
  display: flex; flex-direction: column; gap: 2px;
}
.np-track-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.np-track-item:hover { background: rgba(255,255,255,0.05); }
.np-track-item.current { background: rgba(249,21,54,0.1); }
.np-track-item.current .np-ti-num { color: var(--red); }
.np-ti-num {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.25); text-align: right;
}
.np-ti-info { min-width: 0; }
.np-ti-title {
  font-size: 13px; font-weight: 600;
  color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.np-ti-artist {
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin-top: 1px;
}
.np-ti-dur {
  font-size: 11px; color: rgba(255,255,255,0.3);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* 상세보기 버튼 (미니 플레이어 내) */
.np-detail-btn {
  width: 32px; height: 32px; border-radius: 6px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5); font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.np-detail-btn:hover { background: rgba(249,21,54,0.2); color: var(--red); }

/* ── 반응형 ── */
@media (max-width: 860px) {
  .np-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .np-left {
    flex-direction: row; flex-wrap: wrap;
    border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 16px 20px; gap: 16px;
    justify-content: flex-start;
  }
  .np-vinyl-wrap { width: 80px; }
  .np-meta { text-align: left; flex: 1; }
  .np-meta-title { font-size: 14px; }
  .np-controls { gap: 8px; }
  .np-ctrl { font-size: 13px; padding: 6px; }
  .np-ctrl-play { width: 36px; height: 36px; font-size: 14px; }
  .np-prog-wrap { flex-basis: 100%; }
  .np-tabs { padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
  .np-tab { padding: 14px 12px 12px; font-size: 11px; }
  .np-pane { padding: 20px 20px 32px; }
}
`;

  /* ── CSS 삽입 ── */
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── 패널 DOM 삽입 ── */
  document.body.insertAdjacentHTML('beforeend', panelHTML);

  /* ── 미니 플레이어에 버튼 주입 ── */
  const miniPlayer = document.getElementById('miniPlayer');
  if (miniPlayer) {
    const btn = document.createElement('button');
    btn.className = 'np-detail-btn';
    btn.id = 'npDetailBtn';
    btn.setAttribute('aria-label', '곡 상세보기');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="12" height="1.2" rx="0.6" fill="currentColor"/>
      <rect x="1" y="5.4" width="8" height="1.2" rx="0.6" fill="currentColor"/>
      <rect x="1" y="8.8" width="10" height="1.2" rx="0.6" fill="currentColor"/>
      <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="1.2"/>
      <line x1="12.4" y1="12.4" x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
    /* 하트 버튼 바로 뒤에 삽입 */
    const likeBtn = miniPlayer.querySelector('.player-like');
    if (likeBtn) likeBtn.insertAdjacentElement('afterend', btn);
    else miniPlayer.appendChild(btn);
    btn.addEventListener('click', openPanel);
  }

  /* ── 요소 참조 ── */
  const panel     = document.getElementById('npPanel');
  const closeBtn  = document.getElementById('npClose');
  const backdrop  = panel.querySelector('.np-backdrop');
  const npVinyl   = document.getElementById('npVinyl');
  const npPlay    = document.getElementById('npPlay');
  const npPrev    = document.getElementById('npPrev');
  const npNext    = document.getElementById('npNext');
  const npProgFill= document.getElementById('npProgFill');
  const npProgBar = panel.querySelector('.np-prog-bar');
  const npCurTime = document.getElementById('npCurTime');
  const npTotalTime = document.getElementById('npTotalTime');
  const tabs      = panel.querySelectorAll('.np-tab');
  const panes     = panel.querySelectorAll('.np-pane');

  let npPlaying = false;
  let npProgress = 38;
  let npTimer = null;

  /* ── 트랙 렌더 ── */
  function renderTrack(idx) {
    const t = TRACKS[idx];
    if (!t) return;
    currentTrack = idx;

    /* 라벨 */
    document.getElementById('npLabelTitle').textContent = t.title;
    document.getElementById('npLabelCat').textContent   = t.label;
    const allTitles = TRACKS.map(x => x.title).join(' · ');
    document.getElementById('npLabelTracks').textContent = allTitles;

    /* 메타 */
    document.getElementById('npMetaTitle').textContent  = t.title;
    document.getElementById('npMetaArtist').textContent = t.artist;
    document.getElementById('npGenreTag').textContent   = t.genre;
    document.getElementById('npYear').textContent       = t.year;

    /* 가사 */
    document.getElementById('npLyricsTrack').textContent  = t.title;
    document.getElementById('npLyricsArtist').textContent = t.artist;
    document.getElementById('npLyricsBody').textContent   = t.lyrics;

    /* 시간 */
    npTotalTime.textContent = t.duration;
    npProgress = 0;
    updateProgress(0);

    /* 플리 현재 트랙 하이라이트 */
    panel.querySelectorAll('.np-track-item').forEach(el => {
      el.classList.toggle('current', parseInt(el.dataset.idx, 10) === idx);
    });
  }

  /* ── 트랙 리스트 생성 ── */
  function buildList(containerId, indices) {
    const ul = document.getElementById(containerId);
    if (!ul) return;
    ul.innerHTML = '';
    indices.forEach((ti, rank) => {
      const t = TRACKS[ti];
      if (!t) return;
      const li = document.createElement('li');
      li.className = 'np-track-item' + (ti === currentTrack ? ' current' : '');
      li.dataset.idx = ti;
      li.innerHTML = `
        <span class="np-ti-num">${rank + 1}</span>
        <div class="np-ti-info">
          <div class="np-ti-title">${t.title}</div>
          <div class="np-ti-artist">${t.artist}</div>
        </div>
        <span class="np-ti-dur">${t.duration}</span>`;
      li.addEventListener('click', () => {
        renderTrack(ti);
        syncMainPlayer();
      });
      ul.appendChild(li);
    });
  }

  /* 곡 제목 배열 → TRACKS 인덱스 배열 (TRACKS에 없는 제목은 무시) */
  function titlesToIndices(titles) {
    return titles
      .map(title => TRACKS.findIndex(t => t.title === title))
      .filter(idx => idx >= 0);
  }

  function buildAllLists() {
    buildList('npPlaylistList', TRACKS.map((_, i) => i));
    buildList('npRecentList',   titlesToIndices(RECENT));
    buildList('npLikedList',    titlesToIndices(LIKED));
    buildList('npPopularList',  titlesToIndices(POPULAR));
  }

  /* ── 메인 플레이어와 동기화 ── */
  function syncMainPlayer() {
    const pName   = document.getElementById('playerName')   || document.querySelector('.player-name');
    const pArtist = document.getElementById('playerArtist') || document.querySelector('.player-artist');
    const t = TRACKS[currentTrack];
    if (!t) return;
    if (pName)   pName.textContent   = t.title;
    if (pArtist) pArtist.textContent = t.artist;
  }

  /* ── 재생 진행 ── */
  function updateProgress(pct) {
    npProgress = pct;
    npProgFill.style.width = pct + '%';
    const total = TRACKS[currentTrack] ? parseTime(TRACKS[currentTrack].duration) : 228;
    const sec   = Math.floor(total * pct / 100);
    npCurTime.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function parseTime(str) {
    const parts = str.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function startPlay() {
    npPlaying = true;
    npPlay.textContent = '⏸';
    npVinyl.classList.add('spinning');
    const disc = document.getElementById('playerDisc');
    if (disc) disc.classList.add('spinning');
    clearInterval(npTimer);
    npTimer = setInterval(() => {
      npProgress = Math.min(npProgress + 0.05, 100);
      updateProgress(npProgress);
      if (npProgress >= 100) {
        clearInterval(npTimer);
        npPlaying = false;
        npPlay.textContent = '▶';
        npVinyl.classList.remove('spinning');
      }
    }, 100);
  }

  function stopPlay() {
    npPlaying = false;
    npPlay.textContent = '▶';
    npVinyl.classList.remove('spinning');
    clearInterval(npTimer);
  }

  /* ── 실제 재생 중인 곡으로 currentTrack 동기화 ──
     미니 플레이어(#playerName)에 표시된 제목을 TRACKS에서 찾아 일치시킨다.
     찾으면 해당 트랙으로, 못 찾으면(아직 TRACKS에 없는 곡) 미니 플레이어의
     제목/아티스트만 임시로 표시해 최소한 "지금 재생 중" 정보는 맞게 보여준다. */
  function syncFromMainPlayer() {
    const pName   = document.getElementById('playerName')   || document.querySelector('.player-name');
    const pArtist = document.getElementById('playerArtist') || document.querySelector('.player-artist');
    const title = pName ? pName.textContent.trim() : '';
    if (!title) return;

    const idx = TRACKS.findIndex(t => t.title === title);
    if (idx >= 0) {
      currentTrack = idx;
      return;
    }

    /* TRACKS에 없는 곡 — 임시 트랙 객체로 currentTrack 대체 표시 */
    currentTrack = -1;
    document.getElementById('npLabelTitle').textContent  = title;
    document.getElementById('npMetaTitle').textContent   = title;
    document.getElementById('npLyricsTrack').textContent = title;
    const artist = pArtist ? pArtist.textContent.trim() : '';
    document.getElementById('npMetaArtist').textContent   = artist;
    document.getElementById('npLyricsArtist').textContent = artist;
    document.getElementById('npLyricsBody').textContent   = '(가사 준비 중입니다)';
  }

  /* ── 실제 미니 플레이어 진행바 → 패널 진행바 실시간 미러링 ──
     차트 등에서 재생 중인 실제 진행률(#progressFill, #currentTime 등)을
     패널이 열려 있는 동안 주기적으로 읽어와 그대로 반영한다. */
  let npMirrorTimer = null;
  function syncProgressFromMainPlayer() {
    const realFill = document.getElementById('progressFill');
    if (!realFill) return;
    const realCur  = document.getElementById('currentTime');
    const realTot  = document.getElementById('totalTime');
    const realDisc = document.getElementById('playerDisc');

    npProgFill.style.width = realFill.style.width || '0%';
    if (realCur) npCurTime.textContent   = realCur.textContent;
    if (realTot) npTotalTime.textContent = realTot.textContent;

    const playing = realDisc ? realDisc.classList.contains('spinning') : npPlaying;
    npPlaying = playing;
    npPlay.textContent = playing ? '⏸' : '▶';
    npVinyl.classList.toggle('spinning', playing);
  }
  function startProgressMirror() {
    clearInterval(npTimer);
    clearInterval(npMirrorTimer);
    syncProgressFromMainPlayer();
    npMirrorTimer = setInterval(syncProgressFromMainPlayer, 250);
  }
  function stopProgressMirror() {
    clearInterval(npMirrorTimer);
  }

  /* ── 패널 열기/닫기 ── */
  function openPanel() {
    buildAllLists();
    syncFromMainPlayer();
    if (currentTrack >= 0) renderTrack(currentTrack);
    startProgressMirror();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopProgressMirror();
  }

  /* ── 이벤트 ── */
  closeBtn.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  /* ESC */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  /* 탭 전환 */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('np-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  /* 재생/일시정지 — 실제 미니 플레이어가 있으면 그걸 그대로 조작 */
  npPlay.addEventListener('click', () => {
    const realPlay = document.getElementById('playPauseBtn');
    if (realPlay) { realPlay.click(); syncProgressFromMainPlayer(); }
    else if (npPlaying) stopPlay(); else startPlay();
  });

  /* 이전/다음 — 실제 컨트롤이 있으면 그걸 클릭해서 진짜 곡을 넘기고,
     바뀐 곡 정보를 패널에 다시 동기화한다 */
  function refreshAfterRealNav() {
    syncFromMainPlayer();
    if (currentTrack >= 0) renderTrack(currentTrack);
    syncProgressFromMainPlayer();
  }
  npPrev.addEventListener('click', () => {
    const realPrev = document.getElementById('prevBtn');
    if (realPrev) { realPrev.click(); refreshAfterRealNav(); return; }
    const idx = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
    renderTrack(idx); syncMainPlayer();
  });
  npNext.addEventListener('click', () => {
    const realNext = document.getElementById('nextBtn');
    if (realNext) { realNext.click(); refreshAfterRealNav(); return; }
    const idx = (currentTrack + 1) % TRACKS.length;
    renderTrack(idx); syncMainPlayer();
  });

  /* 프로그레스 바 클릭 — 실제 진행바가 있으면 그걸 클릭해서 진짜 재생 위치를 옮긴다 */
  npProgBar.addEventListener('click', e => {
    const realBar = document.getElementById('progressBar');
    if (realBar) {
      const r = realBar.getBoundingClientRect();
      realBar.dispatchEvent(new MouseEvent('click', { clientX: r.left + (e.clientX - npProgBar.getBoundingClientRect().left) / npProgBar.getBoundingClientRect().width * r.width, clientY: r.top }));
      syncProgressFromMainPlayer();
      return;
    }
    const rect = npProgBar.getBoundingClientRect();
    updateProgress(((e.clientX - rect.left) / rect.width) * 100);
  });

  /* 미니 플레이어 디스크/트랙 클릭 → 패널 열기 (있는 경우)
     단, chart.js가 #fullPanel(플레이리스트+가사 패널)을 이미 그 자리에 연결해둔
     페이지(chart.html)에서는 두 패널이 동시에 열려 하단이 겹쳐 보이는 버그가
     있었으므로 건너뛴다 — 그 페이지에서는 "상세보기" 아이콘으로만 이 패널을 연다. */
  const playerTrack = document.getElementById('playerTrack');
  if (playerTrack && !document.getElementById('fullPanel')) {
    playerTrack.addEventListener('click', openPanel);
  }

  /* URL 파라미터에서 트랙 읽기 */
  const urlTrack = parseInt(new URLSearchParams(window.location.search).get('track'), 10);
  if (!isNaN(urlTrack) && urlTrack >= 0 && urlTrack < TRACKS.length) {
    currentTrack = urlTrack;
  }

  /* ── 마퀴 스틸컷 팝업 ──
     transform된 부모(.marquee-track) 안의 position:fixed는 좌표가 틀어지므로
     body에 단일 팝업 레이어를 만들고 hover 시 이미지를 교체한다 */
  const popup = document.createElement('div');
  popup.id = 'marqueePopup';
  popup.style.cssText = [
    'position:fixed', 'z-index:9100', 'pointer-events:none',
    'width:220px', 'height:220px', 'border-radius:12px', 'overflow:hidden',
    'border:1px solid rgba(255,255,255,0.1)',
    'box-shadow:0 24px 64px rgba(0,0,0,0.9),0 0 0 1px rgba(255,255,255,0.04)',
    'background:#111',
    'opacity:0',
    'transition:opacity 0.18s ease, transform 0.18s cubic-bezier(0.23,1,0.32,1)',
    'transform:scale(0.92) translateY(6px)',
    'top:0', 'left:0'
  ].join(';');

  const popupImg = document.createElement('img');
  popupImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  popup.appendChild(popupImg);

  const popupLabel = document.createElement('div');
  popupLabel.style.cssText = [
    'position:absolute', 'bottom:0', 'left:0', 'right:0',
    'padding:28px 14px 12px',
    'background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)',
    'font-size:10px', 'font-weight:700', 'letter-spacing:0.18em',
    'text-transform:uppercase', 'color:rgba(255,255,255,0.8)',
    "font-family:'Montserrat',sans-serif"
  ].join(';');
  popup.appendChild(popupLabel);
  document.body.appendChild(popup);

  const GAP = 18;
  const W = 220, H = 220;

  /* 마퀴 요소(fixed, overflow:hidden) 안에서 애니메이션으로 이동하면
     mouseleave가 발화 안 되는 경우가 있어서 — 전역 mousemove로 보완 */
  const marqueeEl = document.querySelector('.site-marquee');

  function hidePopup() {
    popup.style.opacity   = '0';
    popup.style.transform = 'scale(0.92) translateY(6px)';
  }

  /* 마우스가 마퀴 영역 밖에 있으면 항상 숨김 */
  document.addEventListener('mousemove', e => {
    if (!marqueeEl) return;
    const r = marqueeEl.getBoundingClientRect();
    const inMarquee = e.clientX >= r.left && e.clientX <= r.right &&
                      e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!inMarquee) hidePopup();
  }, { passive: true });

  document.querySelectorAll('.marquee-item-wrap').forEach(wrap => {
    const still = wrap.querySelector('.marquee-still');
    const src   = still ? (still.querySelector('img') || {}).src : null;
    const label = still ? (still.dataset.label || '') : '';

    /* 이미지가 없는 항목은 팝업 없음 */
    if (!src) return;

    wrap.addEventListener('mouseenter', e => {
      /* 마퀴 영역 안에 있을 때만 표시 */
      if (!marqueeEl) return;
      const r = marqueeEl.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;

      popupImg.src = src;
      popupLabel.textContent = label;
      popup.style.opacity   = '1';
      popup.style.transform = 'scale(1) translateY(0)';
    });
    wrap.addEventListener('mouseleave', hidePopup);
    wrap.addEventListener('mousemove', e => {
      /* 마퀴 영역 밖이면 즉시 숨김 */
      if (marqueeEl) {
        const r = marqueeEl.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom) { hidePopup(); return; }
      }
      let x = e.clientX + GAP;
      let y = e.clientY - H - GAP;
      if (x + W > window.innerWidth - 8) x = e.clientX - W - GAP;
      if (y < 8) y = e.clientY + GAP;
      popup.style.left = x + 'px';
      popup.style.top  = y + 'px';
    });
  });

  /* ── 인덱스 카드 3D 마우스 틸트 (preserve-3d 적용) ── */
  document.querySelectorAll('.card-img-block').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'box-shadow 0.5s';
      card.style.transform = `translateZ(10px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s';
      card.style.transform  = '';
    });
  });

})();
