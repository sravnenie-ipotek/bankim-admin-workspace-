<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентсайта№12.1|Меню|Default|RU</title>
	<style>
		body {
			font-family: system-ui;
		}
		.box {
			width: 264px;
			height: 1px;
			background: #374151;
			margin-bottom: 24px;
		}
		.box2 {
			width: 1px;
			height: 1160px;
			background: #374151;
		}
		.box3 {
			height: 1px;
			align-self: stretch;
			background: #374151;
		}
		.box4 {
			width: 224px;
			height: 1px;
			background: #374151;
		}
		.box5 {
			width: 115px;
			height: 50px;
			background: #374151;
		}
		.box6 {
			width: 115px;
			height: 1px;
			background: #374151;
		}
		.column {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column2 {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 40px;
		}
		.column3 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 105px;
			margin-right: 105px;
			gap: 40px;
		}
		.column4 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 24px;
		}
		.column5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #0000001A;
		}
		.column6 {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column7 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.contain {
			background: #FFFFFF;
		}
		.image {
			width: 264px;
			height: 48px;
			margin-bottom: 40px;
			object-fit: fill;
		}
		.image2 {
			width: 24px;
			height: 24px;
			object-fit: fill;
		}
		.image3 {
			width: 24px;
			height: 24px;
			margin-right: 12px;
			object-fit: fill;
		}
		.image4 {
			width: 28px;
			height: 28px;
			object-fit: fill;
		}
		.image5 {
			width: 40px;
			height: 40px;
			object-fit: fill;
		}
		.image6 {
			width: 32px;
			height: 32px;
			object-fit: fill;
		}
		.image7 {
			width: 16px;
			height: 16px;
			object-fit: fill;
		}
		.image8 {
			width: 115px;
			height: 53px;
			object-fit: fill;
		}
		.image9 {
			border-radius: 4px;
			width: 44px;
			height: 33px;
			object-fit: fill;
		}
		.row-view {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
			background: #111928;
		}
		.row-view2 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
		}
		.row-view3 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view4 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			margin-right: 20px;
			gap: 12px;
		}
		.row-view5 {
			display: flex;
			align-items: center;
			margin-bottom: 23px;
			margin-left: 20px;
			margin-right: 20px;
		}
		.row-view6 {
			display: flex;
			align-items: flex-start;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view7 {
			align-self: stretch;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			background: #1F2A37;
			padding: 24px 40px 24px 667px;
			gap: 32px;
			box-shadow: 0px 2px 4px #0000000D;
		}
		.row-view8 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view9 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.row-view10 {
			display: flex;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 12px 89px 12px 16px;
			margin: 16px;
			gap: 10px;
		}
		.row-view11 {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
		}
		.row-view12 {
			align-self: stretch;
			display: flex;
			align-items: center;
			padding: 16px;
		}
		.row-view13 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			border-radius: 4px;
			border: 1px solid #374151;
		}
		.text {
			color: #FBE54D;
			font-size: 16px;
			font-weight: bold;
		}
		.text2 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
		}
		.text3 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-right: 54px;
		}
		.text4 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 30px;
			font-weight: bold;
		}
		.text6 {
			color: #FFFFFF;
			font-size: 24px;
			font-weight: bold;
		}
		.text7 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text8 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
			margin-left: 16px;
		}
		.text9 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 16px 17px 16px;
		}
		.text10 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 195px 16px 16px;
		}
		.text12 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 194px 15px 16px;
			width: 14px;
		}
		.text13 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 195px 15px 16px;
			width: 13px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 202px 15px 16px;
			width: 6px;
		}
		.text15 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 194px 16px 16px;
		}
		.text16 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
		}
		.text17 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 93px 15px 16px;
			width: 115px;
		}
		.text18 {
			color: #9CA3AF;
			font-size: 14px;
			flex: 1;
		}
		.text19 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text20 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.view {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.view2 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding-top: 16px;
			padding-bottom: 16px;
		}
		.view3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 58px 16px 16px;
		}
		.view4 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 94px 16px 16px;
		}
		.view5 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
		.view6 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
	</style>
</head>
<body>
		<div class="contain">
		<div class="row-view">
			<div class="row-view2">
				<div class="column">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/974d7egu_expires_30_days.png" 
						class="image"
					/>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1qajzafs_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Главная
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/wg3nd89b_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Пользователи
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/u29bo5hr_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Клиенты
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ntfhp6sl_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Предложения
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/wln6h55e_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							История Действий
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/vsnkpo3x_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Банковские программы
						</span>
					</div>
					<div class="row-view4">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/dy2rr93k_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Создание аудитории
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hudpelxv_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Формула калькулятора
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/9eyhran8_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Чат
						</span>
					</div>
					<div class="row-view5">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/qd4tv2js_expires_30_days.png" 
							class="image3"
						/>
						<span class="text3" >
							Контент сайта
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/abkjljv0_expires_30_days.png" 
							class="image4"
						/>
					</div>
					<div class="box">
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/zwz0cjze_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Настройки
						</span>
					</div>
					<div class="row-view6">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/s44bkvmd_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Выйти
						</span>
					</div>
				</div>
				<div class="box2">
				</div>
			</div>
			<div class="column2">
				<div class="row-view7">
					<div class="row-view8">
						<span class="text4" >
							Русский
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/io77j8g5_expires_30_days.png" 
							class="image2"
						/>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/cffn422j_expires_30_days.png" 
						class="image5"
					/>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lbr9zd5w_expires_30_days.png" 
						class="image5"
					/>
					<div class="row-view9">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/e852cetf_expires_30_days.png" 
							class="image6"
						/>
						<div class="view">
							<span class="text4" >
								Александр пушкин
							</span>
						</div>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/mczhilgc_expires_30_days.png" 
							class="image2"
						/>
					</div>
				</div>
				<div class="column3">
					<span class="text5" >
						Меню
					</span>
					<div class="column4">
						<span class="text6" >
							Список страниц
						</span>
						<div class="column5">
							<div class="row-view10">
								<img
									src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1wfoony4_expires_30_days.png" 
									class="image7"
								/>
								<span class="text7" >
									Искать по названию, ID, номеру страницы
								</span>
							</div>
							<div class="row-view11">
								<div class="column6">
									<div class="view2">
										<span class="text8" >
											НАЗВАНИЕ СТРАНИЦЫ
										</span>
									</div>
									<div class="box3">
									</div>
									<span class="text9" >
										15.1 Сайд навигация. Меню
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										16. О нас. Меню
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										17. Вакансии
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										17.1 Вакансии. Описание и анкета кандидата
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										17.2 Вакансии. Заявка принята в обработку
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										18.Контакты
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										19. Реферальная программа
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										20. Франшиза для брокеров
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										20.1 Брокеры. Анкета для сотрудничества
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										20.2 Брокеры. Заявка принята в обработку
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										20А. Франшиза для риэлторов
									</span>
									<div class="box3">
									</div>
									<span class="text9" >
										20А.1 Риэлторы. Анкета для сотрудничества
									</span>
								</div>
								<div class="column">
									<div class="view3">
										<span class="text10" >
											Количество действии
										</span>
									</div>
									<div class="box4">
									</div>
									<span class="text11" >
										17
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										26
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										28
									</span>
									<div class="box4">
									</div>
									<span class="text13" >
										17
									</span>
									<div class="box4">
									</div>
									<span class="text14" >
										2
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										46
									</span>
									<div class="box4">
									</div>
									<span class="text15" >
										32
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										40
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										21
									</span>
									<div class="box4">
									</div>
									<span class="text14" >
										2
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										39
									</span>
									<div class="box4">
									</div>
									<span class="text12" >
										18
									</span>
								</div>
								<div class="column">
									<div class="view4">
										<span class="text10" >
											Были изменения
										</span>
									</div>
									<div class="box4">
									</div>
									<span class="text16" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										01.08.2023 | 12:03
									</span>
								</div>
								<div class="column7">
									<div class="box5">
									</div>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/okktg9ly_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/628ydior_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/j2nxhqr3_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/xakfm1ag_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/9zjqwr9p_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/z60fet00_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/y2966bqk_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ro5wkgrj_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ro7ohduf_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/onmhm5rl_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/czaat9fx_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/b8xlp3x3_expires_30_days.png" 
										class="image8"
									/>
								</div>
							</div>
							<div class="row-view12">
								<span class="text18" >
									Показывает 1-20 из 1000
								</span>
								<div class="row-view13">
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/5y0ihmn0_expires_30_days.png" 
										class="image9"
									/>
									<div class="view5">
										<span class="text19" >
											1
										</span>
									</div>
									<div class="view6">
										<span class="text20" >
											2
										</span>
									</div>
									<div class="view5">
										<span class="text19" >
											3
										</span>
									</div>
									<div class="view5">
										<span class="text19" >
											...
										</span>
									</div>
									<div class="view5">
										<span class="text19" >
											100
										</span>
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/5z7uf3o4_expires_30_days.png" 
										class="image9"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>