import { SCENE, FONT_SIZE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground, createCenteredText } from '../ui/scene_utils.js';

export class CreditsScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.CREDITS];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        createCenteredText(sceneEl, 'クレジット（音声出典・権利情報）', { top: 60, fontSize: FONT_SIZE.MEDIUM });

        const panelTop = 160;
        const panelBottom = this.game.baseHeight - 100 - 60 - 20;

        this.panelEl = document.createElement('div');
        this.panelEl.className = 'content-panel';
        this.panelEl.style.position = 'absolute';
        this.panelEl.style.left = '160px';
        this.panelEl.style.top = `${panelTop}px`;
        this.panelEl.style.width = '1600px';
        this.panelEl.style.maxHeight = `${panelBottom - panelTop}px`;
        this.panelEl.style.padding = '0';
        this.panelEl.style.overflow = 'hidden';
        sceneEl.appendChild(this.panelEl);

        this.contentEl = document.createElement('div');
        this.contentEl.style.width = '100%';
        this.contentEl.style.maxHeight = `${panelBottom - panelTop}px`;
        this.contentEl.style.overflowY = 'auto';
        this.contentEl.style.boxSizing = 'border-box';
        this.contentEl.style.padding = '32px 48px';
        this.contentEl.style.fontSize = '26px';
        this.contentEl.style.lineHeight = '42px';
        this.contentEl.style.color = 'var(--color-ink)';
        this.panelEl.appendChild(this.contentEl);

        this.renderCredits();

        const btnWidth = 400;
        const btnHeight = 90;
        const bottomBtnY = this.game.baseHeight - btnHeight - 50;
        const backBtnX = 160;
        this.backButton = new Button(backBtnX, bottomBtnY, btnWidth, btnHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);
        this.backButton.mount(sceneEl);
    }

    renderCredits() {
        const sections = [
            {
                title: '■ BGM / ジングル',
                items: [
                    {
                        site: 'MusMus (ムズムズ)',
                        author: 'watson',
                        url: 'https://musmus.main.jp/',
                        termsUrl: 'https://musmus.main.jp/about.html',
                        note: '商用・非商用問わずフリー利用可能（著作権者・サイト名のクレジット表記が必要）',
                        tracks: [
                            {
                                name: 'タイトルBGM: 「かぼちゃ騎士団の行進」 (BGM070)',
                                pageUrl: 'https://musmus.main.jp/bgm_13.html'
                            },
                            {
                                name: 'ゲームプレイBGM: 「ひまわり森のだいぼうけん」 (BGM-058)',
                                pageUrl: 'https://musmus.main.jp/bgm_14.html'
                            },
                            {
                                name: 'ゲームオーバーBGM: 「ジングル002」 (JGL-002)',
                                pageUrl: 'https://musmus.main.jp/jingle_03.html'
                            }
                        ]
                    }
                ]
            },
            {
                title: '■ 楽器演奏音源（プレイヤー演奏用）',
                items: [
                    {
                        site: '魔王魂',
                        author: '森田交一 (KOUICHI) / 株式会社ジョーカーサウンズ',
                        url: 'https://maou.audio/',
                        termsUrl: 'https://maou.audio/rule/',
                        note: '商用・非商用問わずフリー利用可能。アプリ・ゲーム組み込み自由。',
                        tracks: [
                            {
                                name: 'ピアノ音源（ド・レ・ミ・ファ・ソ・ラ・シ 全7音階）',
                                pageUrl: 'https://maou.audio/se_inst_piano1/'
                            },
                            {
                                name: 'ドラムセット単音（ハイハット、シンバル、スネア、タム 全6音）',
                                pageUrl: 'https://maou.audio/se_inst_drum2/'
                            }
                        ]
                    },
                    {
                        site: 'MMT STUDIO',
                        author: 'MMT38',
                        url: 'https://mmt38.info/',
                        termsUrl: 'https://mmt38.info/',
                        note: '商用・非商用問わずフリー利用可能。クレジット任意。',
                        tracks: [
                            {
                                name: 'アコースティックギター コード音（Am, C, Em, F 全4コード）',
                                pageUrl: 'https://mmt38.info/se/guitar/'
                            },
                            {
                                name: 'トライアングル単音',
                                pageUrl: 'https://mmt38.info/se/instrumental/'
                            }
                        ]
                    },
                    {
                        site: '効果音ラボ',
                        author: '',
                        url: 'https://soundeffect-lab.info/',
                        termsUrl: 'https://soundeffect-lab.info/agreement/',
                        note: '完全無料・商用利用可能・クレジット不要。ゲーム組み込み規約準拠。',
                        tracks: [
                            {
                                name: '和太鼓音源（「和太鼓でドン」「和太鼓でドドン」「和太鼓でカカッ」全3音）',
                                pageUrl: 'https://soundeffect-lab.info/sound/anime/'
                            }
                        ]
                    },
                    {
                        site: 'Zvukogram',
                        author: '',
                        url: 'https://zvukogram.com/',
                        termsUrl: 'https://zvukogram.com/',
                        note: 'ロイヤリティフリー素材ライブラリ',
                        tracks: [
                            {
                                name: 'タンバリン・パーカッション音（「Короткий хлопок」クラップ音、タンバリン単音）',
                                pageUrl: 'https://zvukogram.com/category/zvuki-tamburina/'
                            }
                        ]
                    }
                ]
            },
            {
                title: '■ 効果音（システム・アクション）',
                items: [
                    {
                        site: '効果音ラボ',
                        author: '',
                        url: 'https://soundeffect-lab.info/',
                        termsUrl: 'https://soundeffect-lab.info/agreement/',
                        note: '完全無料・商用利用可能・クレジット不要。',
                        tracks: [
                            {
                                name: 'UI決定音（「決定・ボタン押下3」）',
                                pageUrl: 'https://soundeffect-lab.info/sound/button/'
                            },
                            {
                                name: 'ゲームオーバー警告音（「警告音・ビープ音1」）',
                                pageUrl: 'https://soundeffect-lab.info/sound/battle/'
                            },
                            {
                                name: 'ジャンプアクション音（「アニメジャンプ1」）',
                                pageUrl: 'https://soundeffect-lab.info/sound/anime/'
                            }
                        ]
                    },
                    {
                        site: '効果音G',
                        author: '',
                        url: 'https://sfx-g.net/',
                        termsUrl: 'https://sfx-g.net/',
                        note: '商用・非商用問わずフリー利用可能。クレジット不要。',
                        tracks: [
                            {
                                name: '木が倒れる音',
                                pageUrl: 'https://sfx-g.net/sound/%e6%9c%a8%e3%81%8c%e5%80%92%e3%82%8c%e3%82%8b%e9%9f%b3-3/'
                            }
                        ]
                    }
                ]
            }
        ];

        for (const sec of sections) {
            const secTitle = document.createElement('div');
            secTitle.style.fontSize = '30px';
            secTitle.style.fontWeight = 'bold';
            secTitle.style.marginTop = '24px';
            secTitle.style.marginBottom = '14px';
            secTitle.style.borderBottom = '2px solid rgba(74, 63, 53, 0.3)';
            secTitle.style.paddingBottom = '8px';
            secTitle.style.color = 'var(--color-ink)';
            secTitle.textContent = sec.title;
            this.contentEl.appendChild(secTitle);

            for (const item of sec.items) {
                const itemBox = document.createElement('div');
                itemBox.style.marginBottom = '22px';
                itemBox.style.paddingLeft = '12px';

                const header = document.createElement('div');
                header.style.fontWeight = 'bold';
                header.style.fontSize = '27px';
                header.style.color = 'var(--color-ink)';
                
                let titleHtml = `● ${item.site}`;
                if (item.author) titleHtml += ` <span style="font-weight:normal;color:#666;">(作者: ${item.author})</span>`;
                header.innerHTML = titleHtml;
                itemBox.appendChild(header);

                const linkLine = document.createElement('div');
                linkLine.style.fontSize = '24px';
                linkLine.style.color = '#3b6e8c';
                linkLine.style.margin = '4px 0 8px 16px';
                linkLine.innerHTML = `公式サイト: <a href="${item.url}" target="_blank" rel="noopener" style="color:#2a6496;word-break:break-all;">${item.url}</a>` +
                    (item.termsUrl ? ` | <a href="${item.termsUrl}" target="_blank" rel="noopener" style="color:#666;">利用規約</a>` : '') +
                    (item.note ? `<div style="font-size:22px;color:#777;margin-top:2px;">（${item.note}）</div>` : '');
                itemBox.appendChild(linkLine);

                const trackList = document.createElement('div');
                trackList.style.paddingLeft = '20px';
                trackList.style.fontSize = '24px';
                trackList.style.lineHeight = '36px';
                for (const t of item.tracks) {
                    const row = document.createElement('div');
                    row.style.marginBottom = '8px';
                    row.innerHTML = `・ <strong>${t.name}</strong><br>` +
                        `<span style="margin-left:16px;color:#666;font-size:22px;">掲載元: <a href="${t.pageUrl}" target="_blank" rel="noopener" style="color:#2a6496;word-break:break-all;">${t.pageUrl}</a></span>`;
                    trackList.appendChild(row);
                }
                itemBox.appendChild(trackList);
                this.contentEl.appendChild(itemBox);
            }
        }
    }

    destroy() {
        this.game.sceneElements[SCENE.CREDITS].innerHTML = '';
    }
}
