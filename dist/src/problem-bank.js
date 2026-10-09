import {rng,seedNumber} from './math.js';
export const TYPES=[
  ['pooled',0,'집단 합치기'],['urn',0,'관측 두 번과 베이즈'],['hyper',0,'조건부 초기하'],['binomial',0,'조건부 이항'],
  ['weights',1,'상관된 추정량의 최적 가중치'],['joint',1,'공동분포와 공분산'],['paired',1,'짝지은 차이의 분산'],['power',1,'검정력과 표본 계획'],['ci',1,'신뢰구간과 편향'],['family',1,'다중 비교'],['ols',1,'회귀와 예측 오차'],['allocation',1,'층화 표집 최적 배분'],
  ['censored',2,'검열과 최대우도'],['uniform',2,'경계 MLE와 불편화'],['beta',2,'베타 사후 예측'],['normal',2,'정규 사후분포'],['rao',2,'충분통계량으로 개선'],['fisher',2,'정보와 변환의 하한'],
  ['delta',3,'로그오즈 델타 방법'],['risk',3,'수축 추정의 위험'],['logistic',3,'로지스틱 가능도'],['bootstrap',3,'경험분포의 정확한 적률'],['lrt',3,'가능도비와 기각'],['design',3,'최적 배분과 상대 효율']
];
const f=x=>Number(x.toFixed(6)).toString();
const field=(label,value)=>({label,value});
export function choose(n,k){if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0;let v=1;for(let i=1;i<=Math.min(k,n-k);i++)v=v*(n-i+1)/i;return v;}
export function problem(type,seed){
  const spec=TYPES.find(x=>x[0]===type);if(!spec)throw new RangeError('Unknown problem');seedNumber(seed);
  const r=rng(seed),int=(a,b)=>a+Math.floor(r()*(b-a+1)),pick=a=>a[int(0,a.length-1)];let prompt,fields,steps,evidence;
  if(type==='pooled'){
    const n1=int(4,12),n2=int(8,20),m1=int(5,20),m2=m1+int(3,10),v1=int(2,9),v2=int(3,12),n=n1+n2,m=(n1*m1+n2*m2)/n,v=(n1*(v1+(m1-m)**2)+n2*(v2+(m2-m)**2))/n;
    prompt=`집단 A의 크기 ${n1}, 평균 ${m1}, 모집단 방식 분산 ${v1}; B의 크기 ${n2}, 평균 ${m2}, 모집단 방식 분산 ${v2}. 두 집단을 하나의 유한 모집단으로 합칩니다. 합친 평균과 모집단 분산은?`;
    fields=[field('합친 평균',m),field('합친 분산',v)];evidence={n1,n2,m1,m2,v1,v2};steps=[`평균을 크기로 가중: (${n1}×${m1}+${n2}×${m2})/${n}=${f(m)}.`,`각 집단의 분산에 그 평균과 새 평균의 차이 제곱을 더합니다.`,`[${n1}(${v1}+(${m1}−${f(m)})²)+${n2}(${v2}+(${m2}−${f(m)})²)]/${n}=${f(v)}.`];
  }else if(type==='urn'){
    const N=12,K1=int(3,5),K2=int(7,9),a=int(2,7)/10,b=1-a,L1=K1*(K1-1)/(N*(N-1)),L2=K2*(K2-1)/(N*(N-1)),post=a*L1/(a*L1+b*L2),next=post*(K1-2)/(N-2)+(1-post)*(K2-2)/(N-2);
    prompt=`상자 A를 확률 ${a}로, B를 확률 ${f(b)}로 고릅니다. 각 상자에는 공 ${N}개, 빨간 공은 A ${K1}개/B ${K2}개입니다. 고른 상자에서 되넣지 않고 뽑은 처음 두 공이 모두 빨갛습니다. A를 골랐을 사후확률과 같은 상자에서 세 번째 공도 빨갈 예측 확률은?`;
    fields=[field('P(A | 두 빨강)',post),field('P(세 번째 빨강 | 두 빨강)',next)];evidence={N,K1,K2,a};steps=[`두 빨강의 가능도: A=${f(L1)}, B=${f(L2)}. 비복원 추출이므로 성공 수가 하나씩 줄어듭니다.`,`사후 A 가중치를 정규화: ${a}×${f(L1)}/(${a}×${f(L1)}+${f(b)}×${f(L2)})=${f(post)}.`,`남은 공의 빨강 비율을 사후 가중: ${f(post)}×${K1-2}/${N-2}+(1−${f(post)})×${K2-2}/${N-2}=${f(next)}.`];
  }else if(type==='hyper'){
    const N=int(12,20),K=int(4,8),n=int(3,5),den=choose(N,n),none=choose(N-K,n)/den,event=1-none,p2=choose(K,2)*choose(N-K,n-2)/den/event,mean=n*K/N/event;
    prompt=`${N}개 중 성공 표시가 ${K}개입니다. 균등 비복원으로 ${n}개를 뽑고 성공 수를 X라 합니다. X≥1임을 알았을 때 P(X=2 | X≥1)과 E(X | X≥1)은?`;
    fields=[field('조건부 확률',p2),field('조건부 기대 성공 수',mean)];evidence={N,K,n};steps=[`전체 조합 수 C(${N},${n})=${den}. P(X≥1)=1−C(${N-K},${n})/${den}=${f(event)}.`,`두 성공의 조합 확률을 조건의 확률로 나눕니다: ${f(p2)}.`,`X=0인 사건은 기대값에 0만 기여합니다. 따라서 E(X|X≥1)=(nK/N)/P(X≥1)=${f(mean)}.`];
  }else if(type==='binomial'){
    const n=int(5,18),p=int(2,16)/20,p0=(1-p)**n,p1=n*p*(1-p)**(n-1),event=1-p0-p1,p2=choose(n,2)*p*p*(1-p)**(n-2)/event,mean=(n*p-p1)/event;
    prompt=`독립 동일 성공확률 ${p}로 ${n}회 시행합니다. 성공 수 X가 적어도 2일 때 정확히 2일 확률과 조건부 기대 성공 수는?`;
    fields=[field('P(X=2 | X≥2)',p2),field('E(X | X≥2)',mean)];evidence={n,p};steps=[`P(X≥2)=1−(1−p)ⁿ−np(1−p)ⁿ⁻¹=${f(event)}.`,`P(X=2)를 위 확률로 나누면 ${f(p2)}.`,`제외되는 X=1의 기대값 기여가 P(X=1)입니다. [np−P(X=1)]/P(X≥2)=${f(mean)}.`];
  }else if(type==='weights'||type==='paired'){
    const vx=int(4,12),vy=int(13,25),c=int(1,3),n=int(8,20),w=(vy-c)/(vx+vy-2*c),v=(vx*vy-c*c)/(vx+vy-2*c),d=vx+vy-2*c;
    evidence={vx,vy,c,n};
    if(type==='weights'){prompt=`같은 μ를 불편 추정하는 U,V의 분산은 ${vx}, ${vy}, 공분산은 ${c}. wU+(1−w)V의 분산을 최소로 하는 w와 최소 분산은? w는 실수입니다.`;fields=[field('최적 w',w),field('최소 분산',v)];steps=[`분산 w²${vx}+(1−w)²${vy}+2w(1−w)${c}를 w로 미분합니다.`,`w=(${vy}−${c})/(${vx}+${vy}−2×${c})=${f(w)}.`,`최솟값=(Var(U)Var(V)−Cov²)/(Var(U)+Var(V)−2Cov)=${f(v)}.`];}
    else{prompt=`${n}명의 전후 측정 (X,Y)이 사람 사이에는 독립입니다. Var(X)=${vx}, Var(Y)=${vy}, Cov(X,Y)=${c}. 한 사람의 차이 D=Y−X의 분산과 n명 평균 차이의 표준오차는?`;fields=[field('Var(D)',d),field('SE(평균 차이)',Math.sqrt(d/n))];steps=[`같은 사람의 두 측정은 공분산을 갖습니다. Var(Y−X)=${vy}+${vx}−2×${c}=${d}.`,`사람 사이 독립이므로 평균 차이의 분산=${d}/${n}.`,`표준오차는 분산의 제곱근=${f(Math.sqrt(d/n))}. 독립 두 집단으로 처리하면 교차항을 놓칩니다.`];}
  }else if(type==='joint'){
    const a=int(1,4),b=int(2,6),c=int(2,6),d=int(5,9),t=a+b+c+d,ex=(c+d)/t,ey=(b+d)/t,cov=d/t-ex*ey,corr=cov/Math.sqrt(ex*(1-ex)*ey*(1-ey));
    prompt=`0·1 변수 X,Y의 공동확률은 (0,0):${a}/${t}, (0,1):${b}/${t}, (1,0):${c}/${t}, (1,1):${d}/${t}입니다. 공분산과 Pearson 상관계수를 구하세요.`;
    fields=[field('Cov(X,Y)',cov),field('상관계수',corr)];evidence={a,b,c,d};steps=[`E(X)=${f(ex)}, E(Y)=${f(ey)}, E(XY)=${d}/${t}.`,`Cov=E(XY)−E(X)E(Y)=${f(cov)}.`,`Bernoulli 분산 p(1−p)를 두 변수에 적용하고 표준편차의 곱으로 나누면 r=${f(corr)}.`];
  }else if(type==='power'){
    const sigma=int(5,15),delta=pick([1,1.5,2,2.5]),za=1.645,zb=.842,raw=((za+zb)*sigma/delta)**2,n=Math.ceil(raw);
    prompt=`독립 정규 관측, 알려진 σ=${sigma}. H0:μ=0 대 H1:μ>0, 유의수준 5% 단측 검정을 계획합니다. 실제 μ=${delta}에서 검정력 ≥80%가 목표입니다. z₀.₉₅=1.645, z₀.₈₀=0.842를 사용하세요. 필요한 최소 정수 n과 그 n에서 평균의 기각 경계는?`;
    fields=[field('최소 표본 수 (정수)',n),field('x̄ 기각 경계 (초과하면 기각)',za*sigma/Math.sqrt(n))];evidence={sigma,delta,za,zb};steps=[`검정력 조건: δ√n/σ−z₀.₉₅ ≥ z₀.₈₀.`,`n≥[(1.645+0.842)×${sigma}/${delta}]²=${f(raw)}이므로 올림하여 ${n}.`,`H0에서 기각 경계는 1.645×${sigma}/√${n}=${f(fields[1].value)}. 표준정규 임계값을 주어진 값으로 고정했습니다.`];
  }else if(type==='ci'){
    const n=pick([25,36,49,64]),sigma=int(3,12),mean=int(15,30),bias=int(1,3),half=1.96*sigma/Math.sqrt(n);
    prompt=`정규 iid 표본 n=${n}, 알려진 σ=${sigma}, 관측 평균 ${mean}. 우선 편향 없는 모형의 95% 신뢰구간 하한을 구하세요(z=1.96). 이어 같은 표집 절차가 목표 μ보다 ${bias}만큼 큰 평균을 갖도록 편향되었다면, 그 편향의 크기를 표준오차 단위로 나타내세요.`;
    fields=[field('편향 없는 모형의 하한',mean-half),field('편향 / 표준오차',bias/(sigma/Math.sqrt(n)))];evidence={n,sigma,mean,bias};steps=[`SE=${sigma}/√${n}=${f(sigma/Math.sqrt(n))}.`,`하한=${mean}−1.96×SE=${f(mean-half)}.`,`편향의 표준화=${bias}/SE=${f(fields[1].value)}. 표본을 늘려도 편향 크기 자체는 줄지 않습니다.`];
  }else if(type==='family'){
    const m=int(4,24),times=int(2,8),family=m*times,threshold=.05/family,fwer=1-.95**family;
    prompt=`${m}개 지표를 사전에 정한 ${times}시점에 검사합니다. 모든 개별 p값이 유효합니다. 가족 거짓 기각 상한 5%의 Bonferroni 문턱은? 별개의 비교 상황에서 ${family}개 검정이 서로 독립이고 모두 H0가 참이며 각 거짓 기각 확률이 정확히 5%라면, 보정하지 않은 FWER는?`;
    fields=[field('Bonferroni 문턱',threshold),field('독립 비교 상황 FWER (0…1)',fwer)];evidence={m,times};steps=[`사전 가족 수=${m}×${times}=${family}; 문턱=0.05/${family}=${f(threshold)}.`,`독립 비교 상황에서는 모두 기각하지 않을 확률이 0.95^${family}.`,`따라서 FWER=1−0.95^${family}=${f(fwer)}. 실제 반복 시점의 의존성이 있으면 이 독립 정확식을 쓰지 않습니다.`];
  }else if(type==='ols'){
    const n=int(8,20),xbar=int(2,8),ybar=int(12,30),sxx=int(30,90),sxy=int(15,45),rss=int(10,40),syy=Number(f(sxy*sxy/sxx+rss)),x0=xbar+int(2,5),slope=sxy/sxx,vmean=(syy-sxy*sxy/sxx)/(n-2)*(1/n+(x0-xbar)**2/sxx);
    prompt=`절편 포함 단순 선형회귀: n=${n}, x̄=${xbar}, ȳ=${ybar}, Sxx=${sxx}, Sxy=${sxy}, Syy=${f(syy)}(이 값은 표시 정밀도까지 사용). 독립 등분산 정규 오차를 가정합니다. 기울기와 x₀=${x0}에서 평균 반응 추정값의 분산 추정치를 구하세요. 새 관측의 예측 분산이 아닙니다.`;
    fields=[field('기울기',slope),field('평균 반응의 분산 추정',vmean)];evidence={n,xbar,ybar,sxx,sxy,syy:Number(f(syy)),x0};steps=[`기울기 Sxy/Sxx=${f(slope)}.`,`RSS=Syy−Sxy²/Sxx≈${rss}; 잔차 분산 추정=RSS/(n−2)=${f(rss/(n-2))}.`,`평균 반응 분산=σ̂²[1/n+(x₀−x̄)²/Sxx]=${f(vmean)}. 새 관측에는 여기에 σ̂²가 더해집니다.`];
  }else if(type==='allocation'||type==='design'){
    const w=pick([.25,.4,.6,.75]),s1=int(2,5),s2=int(6,12),n=120,part=w*s1/(w*s1+(1-w)*s2),n1=n*part,opt=(w*s1+(1-w)*s2)**2/n,prop=(w*s1*s1+(1-w)*s2*s2)/n;
    prompt=`서로 독립인 두 층의 모집단 비중은 ${w}, ${f(1-w)}; 표준편차는 ${s1}, ${s2}. 복원 표집 총 ${n}회를 층별로 나눠 가중평균을 추정합니다. 연속 배분 근사(정수 반올림 금지)로 분산이 최소인 첫 층 표본 수와 ${type==='design'?'비례 배분 분산 / 최적 배분 분산':'최소 분산'}을 구하세요. 층별 비용은 같습니다.`;
    fields=[field('최적 첫 층 n₁ (연속 근사)',n1),field(type==='design'?'비례 / 최적 분산 비':'최소 분산',type==='design'?prop/opt:opt)];evidence={w,s1,s2,n};steps=[`분산 w²σ₁²/n₁+(1−w)²σ₂²/(n−n₁)를 최소화합니다.`,`Neyman 배분 n₁/n=wσ₁/[wσ₁+(1−w)σ₂]=${f(part)}; n₁=${f(n1)}.`,`최소 분산=[wσ₁+(1−w)σ₂]²/n=${f(opt)}; 비례 배분 분산=${f(prop)}; 상대 비=${f(prop/opt)}.`];
  }else if(type==='censored'){
    const d=int(4,12),c=int(3,9),fail=int(18,45),survive=int(20,70),T=fail+survive,rate=d/T,mean=T/d;
    prompt=`지수 수명 모형 f(t)=λe^(−λt). 독립 비정보성 우측 검열: 실패 ${d}개가 관찰된 시간 합 ${fail}, 검열 ${c}개가 생존 관찰된 시간 합 ${survive}. λ의 MLE와 평균 수명 1/λ의 MLE를 구하세요.`;
    fields=[field('수명률 λ̂',rate),field('평균 수명 MLE',mean)];evidence={d,c,fail,survive};steps=[`실패는 λe^(−λt), 검열은 e^(−λt)를 가능도에 곱합니다. T=${fail}+${survive}=${T}.`,`ℓ=d log λ−λT, 미분 d/λ−T=0: λ̂=${d}/${T}=${f(rate)}.`,`MLE의 변환 성질로 평균 수명 추정=${T}/${d}=${f(mean)}. 검열 시간도 총 노출 시간입니다.`];
  }else if(type==='uniform'){
    const n=int(5,18),M=int(10,30),theta=int(30,50),unbiased=(n+1)/n*M,v=theta*theta/(n*(n+2));
    prompt=`iid Uniform(0,θ) 표본 n=${n}, 관측 최댓값 M=${M}. 최댓값을 불편화한 θ 추정값은? 그 불편추정량의 분산을 참 θ=${theta}에서 계산하세요(관측 M을 분산 식의 θ에 대입하지 마세요).`;
    fields=[field('불편화한 θ 추정',unbiased),field(`참 θ=${theta}에서 분산`,v)];evidence={n,M,theta};steps=[`P(M≤m)=(m/θ)^n에서 E(M)=nθ/(n+1).`,`불편화: (n+1)M/n=${f(unbiased)}.`,`Var(M)=nθ²/[(n+1)²(n+2)]에 배율 제곱을 적용: θ²/[n(n+2)]=${f(v)}.`];
  }else if(type==='beta'){
    const a=int(1,5),b=int(2,6),n=int(12,30),s=int(3,n-3),A=a+s,B=b+n-s,mean=A/(A+B),both=A*(A+1)/((A+B)*(A+B+1));
    prompt=`p~Beta(${a},${b}), 주어진 p에서 독립 Bernoulli ${n}회 중 성공 ${s}회. p의 사후평균과 다음 두 시행이 모두 성공할 사후 예측 확률은?`;
    fields=[field('사후평균',mean),field('두 미래 시행 모두 성공',both)];evidence={a,b,n,s};steps=[`사후 Beta(A=${A},B=${B}).`,`E(p|자료)=A/(A+B)=${f(mean)}.`,`예측은 E(p²|자료)=A(A+1)/[(A+B)(A+B+1)]=${f(both)}. 평균을 제곱한 ${f(mean*mean)}와 다릅니다.`];
  }else if(type==='normal'){
    const mu0=int(2,8),tau2=int(2,8),sigma2=int(8,20),n=int(5,15),mean=int(10,20),v=1/(1/tau2+n/sigma2),post=v*(mu0/tau2+n*mean/sigma2);
    prompt=`μ~N(${mu0},${tau2}) (두 번째 인수는 분산). iid Xᵢ|μ~N(μ,${sigma2}), 알려진 관측 분산. n=${n}, x̄=${mean}. μ의 사후평균과 새 X의 사후 예측 분산은?`;
    fields=[field('μ 사후평균',post),field('새 관측의 예측 분산',sigma2+v)];evidence={mu0,tau2,sigma2,n,mean};steps=[`사후 정밀도=1/${tau2}+${n}/${sigma2}; 사후 분산 V=${f(v)}.`,`사후평균 V[${mu0}/${tau2}+${n}×${mean}/${sigma2}]=${f(post)}.`,`새 관측의 변동과 μ 불확실성을 합치면 ${sigma2}+V=${f(sigma2+v)}.`];
  }else if(type==='rao'){
    const n=int(6,14),s=int(2,n-2),p=pick([.2,.3,.4,.6]),estimate=s*(s-1)/(n*(n-1));let variance=0;
    for(let k=0;k<=n;k++){const q=k*(k-1)/(n*(n-1));variance+=choose(n,k)*p**k*(1-p)**(n-k)*(q-p*p)**2;}
    prompt=`iid Bernoulli(p) ${n}개로 p²를 추정합니다. 원래 불편추정량 X₁X₂를 충분통계량 S=ΣXᵢ로 Rao–Blackwell화하세요. 관측 S=${s}에서 추정값과 참 p=${p}에서 개선된 추정량의 분산은? 유한 합으로 계산해도 됩니다.`;
    fields=[field('조건부 평균 추정값',estimate),field('개선 추정량의 분산',variance)];evidence={n,s,p};steps=[`성공 위치가 균등하므로 E(X₁X₂|S)=S(S−1)/[n(n−1)]. 관측값 ${f(estimate)}.`,`S~Binomial(${n},${p}). 각 k의 [k(k−1)/(n(n−1))−p²]²를 그 확률로 가중합합니다.`,`합계 Var=${f(variance)}. 원래 Var(X₁X₂)=p²(1−p²)=${f(p*p*(1-p*p))}보다 크지 않습니다.`];
  }else if(type==='fisher'){
    const n=int(8,25),rate=pick([.5,1,1.5,2]),info=n/(rate*rate),bound=1/(n*rate*rate);
    prompt=`iid 지수 수명률 λ 모형, n=${n}, 평가할 참 λ=${rate}. 표본 전체의 Fisher 정보 Iₙ(λ)와 평균 수명 g(λ)=1/λ의 불편추정량에 대한 Cramér–Rao 분산 하한은? 정칙 조건을 가정합니다.`;
    fields=[field('Iₙ(λ)',info),field('g(λ)의 분산 하한',bound)];evidence={n,rate};steps=[`점수 n/λ−Σtᵢ, 정보 Iₙ=n/λ²=${f(info)}.`,`g′(λ)=−1/λ²; 변환 하한 g′(λ)²/Iₙ=1/(nλ²).`,`값=${f(bound)}. 실제 표본평균의 분산 1/(nλ²)이므로 이 경우 하한에 닿습니다.`];
  }else if(type==='delta'||type==='logistic'){
    const n=int(30,100),s=int(Math.ceil(n*.2),Math.floor(n*.8)),p=s/n,eta=Math.log(p/(1-p)),se=1/Math.sqrt(n*p*(1-p)),info=n*p*(1-p);
    prompt=type==='delta'?`iid Bernoulli n=${n}, 성공 ${s}회. p̂의 로그오즈 g(p̂)와 1차 델타 방법의 플러그인 표준오차를 구하세요. 로그는 자연로그입니다.`:`절편만 가진 로지스틱 모형: iid n=${n}, 성공 ${s}회. 로그가능도 ℓ(β)=sβ−n log(1+e^β). 절편 MLE β̂와 그 점에서의 관측 정보 −ℓ″(β̂)는?`;
    fields=[field(type==='delta'?'추정 로그오즈':'절편 MLE',eta),field(type==='delta'?'근사 표준오차':'관측 정보',type==='delta'?se:info)];evidence={n,s};steps=[`p̂=${s}/${n}=${f(p)}. 로그오즈=log[p̂/(1−p̂)]=${f(eta)}.`,type==='delta'?`g′(p)=1/[p(1−p)]; Var(p̂)≈p(1−p)/n.`:`ℓ′=s−np, ℓ″=−np(1−p). 점수를 0으로 두면 p̂=s/n.`,type==='delta'?`SE≈1/√[${n}×${f(p)}×(1−${f(p)})]=${f(se)}. 내부 모수의 큰 표본 근사입니다.`:`정보=np̂(1−p̂)=${f(info)}; 역수는 β̂의 근사 분산입니다.`];
  }else if(type==='risk'){
    const n=int(5,20),sigma2=int(5,20),w=pick([.4,.5,.6,.75]),mu=int(1,5),v=sigma2/n,R=w*w*v+(1-w)**2*mu*mu,cut=Math.sqrt(v*(1+w)/(1-w));
    prompt=`iid N(μ,σ²), n=${n}, 알려진 σ²=${sigma2}. 고정 수축 추정량 μ̃=${w}x̄의 제곱오차 위험을 참 μ=${mu}에서 구하세요. 또 이 추정량의 위험이 x̄보다 작아지는 영역 |μ|<c의 경계 c는?`;
    fields=[field(`μ=${mu}에서 MSE`,R),field('위험 개선 경계 c',cut)];evidence={n,sigma2,w,mu};steps=[`분산 w²σ²/n=${f(w*w*v)}, 편향=(w−1)μ=${f((w-1)*mu)}.`,`MSE=분산+편향²=${f(R)}.`,`w²v+(1−w)²μ²<v ⇒ μ²<v(1+w)/(1−w). c=${f(cut)}. 모든 μ에서 우월하지는 않습니다.`];
  }else if(type==='bootstrap'){
    const data=Array.from({length:int(4,7)},()=>int(1,15)),n=data.length,mean=data.reduce((s,x)=>s+x,0)/n,ss=data.reduce((s,x)=>s+(x-mean)**2,0),v=ss/n/n;
    prompt=`원자료 [${data.join(', ')}]의 경험분포에서 독립 복원으로 원래 크기 ${n}의 부트스트랩 표본을 뽑습니다. 조건부 E*(x̄*)와 Var*(x̄*)를 정확히 계산하세요. 원자료를 고정한 조건부 계산입니다.`;
    fields=[field('E*(x̄*)',mean),field('Var*(x̄*)',v)];evidence={data};steps=[`경험분포의 평균은 원자료 평균 ${f(mean)}.`,`한 복원 관측의 분산=Σ(x−x̄)²/n=${f(ss/n)}.`,`독립 ${n}개 평균의 분산을 다시 ${n}으로 나누면 ${f(v)}. 불편분산의 n−1 분모가 아닙니다.`];
  }else if(type==='lrt'){
    const n=int(20,60),s=int(Math.ceil(n*.58),Math.floor(n*.85)),p=s/n,p0=.5,D=2*(s*Math.log(p/p0)+(n-s)*Math.log((1-p)/(1-p0)));
    prompt=`iid Bernoulli n=${n}, 성공 ${s}. H0:p=0.5와 H1:0<p<1의 가능도비 검정입니다. 통계량 D=−2 log Λ를 구하고, 문제에서 정한 큰 표본 기각 규칙 D>3.841에 따른 기각 여부를 1(기각)/0(기각하지 않음)으로 답하세요. 정확 이항 검정과는 다릅니다.`;
    fields=[field('D=−2 log Λ',D),field('점근 규칙 기각 여부 0/1',D>3.841?1:0)];evidence={n,s,p0};steps=[`대립 모형 MLE p̂=${f(p)}.`,`D=2[s log(p̂/0.5)+(n−s) log((1−p̂)/0.5)]=${f(D)}.`,`3.841과 비교하면 ${D>3.841?'기각':'기각하지 않음'}. χ²₁ 근사 규칙을 지정했으며 유한 표본의 정확한 5%를 주장하지 않습니다.`];
  }
  if(!prompt||!fields||fields.some(x=>!Number.isFinite(x.value)))throw new Error('Invalid generated problem');
  return {type,seed,title:spec[2],level:spec[1],prompt,fields,steps,evidence};
}
export function numericAnswer(input){
  if(typeof input!=='string'||input.length>48)throw new RangeError('숫자 또는 a/b 형태의 분수를 입력하세요.');
  const s=input.trim().replaceAll('−','-'),part='[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][-+]?\\d+)?',regex=new RegExp(`^(${part})(?:/(${part}))?$`),m=s.match(regex);
  if(!m)throw new RangeError('숫자 또는 a/b 형태의 분수를 입력하세요.');const v=Number(m[1])/(m[2]===undefined?1:Number(m[2]));
  if(!Number.isFinite(v)||Math.abs(v)>1e8)throw new RangeError('유한한 수를 입력하세요. 분모는 0이 될 수 없습니다.');return v;
}
export function grade(challenge,inputs,previous=null){
  if(previous!==null)throw new RangeError('이미 답을 확인했습니다. 새 문제를 풀어보세요.');
  if(!challenge||!Array.isArray(inputs))throw new TypeError('Problem required');const actual=problem(challenge.type,challenge.seed);
  if(inputs.length!==actual.fields.length)throw new RangeError('모든 답을 입력하세요.');
  const values=inputs.map(numericAnswer),checks=values.map((v,i)=>Math.abs(v-actual.fields[i].value)<=Math.max(.000002,Math.abs(actual.fields[i].value)*.000002));
  return {correct:checks.every(Boolean),checks,fields:actual.fields,steps:actual.steps};
}
