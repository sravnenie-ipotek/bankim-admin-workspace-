<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентсайта№3|Меню</title>
	<style>
		body {
			font-family: system-ui;
		}
		.box {
			width: 264px;
			height: 1px;
			background: #374151;
			margin-bottom: 23px;
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
		.button-row-view {
			display: flex;
			align-items: flex-start;
			background: #374151;
			border-radius: 4px;
			border: none;
			padding: 7px 8px;
			margin-bottom: 11px;
			margin-left: 8px;
			margin-right: 8px;
			text-align: left;
		}
		.column {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column2 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding-top: 15px;
			margin-bottom: 24px;
		}
		.column3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 23px;
			margin-left: 12px;
			margin-right: 12px;
		}
		.column4 {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 40px;
		}
		.column5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 105px;
			margin-right: 105px;
			gap: 40px;
		}
		.column6 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 24px;
		}
		.column7 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #0000001A;
		}
		.column8 {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column9 {
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
			margin-bottom: 25px;
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
			border-radius: 4px;
			width: 24px;
			height: 24px;
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
			margin-right: 12px;
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
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view3 {
			display: flex;
			align-items: flex-start;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view4 {
			align-self: stretch;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			background: #1F2A37;
			padding: 24px 40px 24px 667px;
			gap: 32px;
			box-shadow: 0px 2px 4px #0000000D;
		}
		.row-view5 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view6 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
		}
		.row-view7 {
			display: flex;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 12px 89px 12px 16px;
			margin: 16px;
			gap: 10px;
		}
		.row-view8 {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
		}
		.row-view9 {
			align-self: stretch;
			display: flex;
			align-items: center;
			padding: 16px;
		}
		.row-view10 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			border-radius: 4px;
			border: 1px solid #374151;
		}
		.text {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
		}
		.text2 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-right: 43px;
		}
		.text3 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 17px;
			margin-left: 56px;
		}
		.text4 {
			color: #FBE54D;
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 17px;
			margin-left: 56px;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 17px;
			margin-left: 56px;
			margin-right: 56px;
		}
		.text6 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-left: 56px;
		}
		.text7 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text8 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
			margin-right: 14px;
		}
		.text9 {
			color: #FFFFFF;
			font-size: 30px;
			font-weight: bold;
		}
		.text10 {
			color: #FFFFFF;
			font-size: 24px;
			font-weight: bold;
		}
		.text11 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text12 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
			margin-left: 16px;
		}
		.text13 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 16px 17px 16px;
		}
		.text14 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
		}
		.text15 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 195px 16px 16px;
		}
		.text16 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 194px 15px 16px;
			width: 14px;
		}
		.text17 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 195px 15px 16px;
			width: 13px;
		}
		.text18 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 202px 15px 16px;
			width: 6px;
		}
		.text19 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 194px 16px 16px;
		}
		.text20 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
		}
		.text21 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 93px 15px 16px;
			width: 115px;
		}
		.text22 {
			color: #9CA3AF;
			font-size: 14px;
			flex: 1;
		}
		.text23 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text24 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.view {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding-top: 16px;
			padding-bottom: 16px;
		}
		.view2 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 58px 16px 16px;
		}
		.view3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 94px 16px 16px;
		}
		.view4 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
		.view5 {
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
			<div class="column">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/qf4c6gib_expires_30_days.png" 
					class="image"
				/>
				<div class="column2">
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8g97w1fc_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Главная
						</span>
					</div>
					<div class="column3">
						<button class="button-row-view"
							onclick="alert('Pressed!')"}>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/39d5lbb0_expires_30_days.png" 
								class="image3"
							/>
							<span class="text2" >
								Контент сайта
							</span>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/l4vcw6er_expires_30_days.png" 
								class="image4"
							/>
						</button>
						<span class="text3" >
							Главная
						</span>
						<span class="text4" >
							Меню
						</span>
						<span class="text5" >
							Рассчитать ипотеку
						</span>
						<span class="text3" >
							Рефинансирование Ипотеки
						</span>
						<span class="text3" >
							Расчет Кредита
						</span>
						<span class="text5" >
							Рефинансирование Кредита
						</span>
						<span class="text6" >
							Общие страницы
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/o04i6hyi_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Чат
						</span>
					</div>
				</div>
				<div class="box">
				</div>
				<div class="row-view2">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/s7e630ep_expires_30_days.png" 
						class="image2"
					/>
					<span class="text" >
						Настройки
					</span>
				</div>
				<div class="row-view3">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ixbp4r1s_expires_30_days.png" 
						class="image2"
					/>
					<span class="text" >
						Выйти
					</span>
				</div>
			</div>
			<div class="box2">
			</div>
			<div class="column4">
				<div class="row-view4">
					<div class="row-view5">
						<span class="text7" >
							Русский
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/jax0e3te_expires_30_days.png" 
							class="image2"
						/>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/j87nwept_expires_30_days.png" 
						class="image5"
					/>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ttrabaiw_expires_30_days.png" 
						class="image5"
					/>
					<div class="row-view6">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ha2sv0t6_expires_30_days.png" 
							class="image6"
						/>
						<span class="text8" >
							Александр пушкин
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/jd9ciqzl_expires_30_days.png" 
							class="image2"
						/>
					</div>
				</div>
				<div class="column5">
					<span class="text9" >
						Меню
					</span>
					<div class="column6">
						<span class="text10" >
							Список страниц
						</span>
						<div class="column7">
							<div class="row-view7">
								<img
									src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7hoxg0zc_expires_30_days.png" 
									class="image7"
								/>
								<span class="text11" >
									Искать по названию, ID, номеру страницы
								</span>
							</div>
							<div class="row-view8">
								<div class="column8">
									<div class="view">
										<span class="text12" >
											НАЗВАНИЕ СТРАНИЦЫ
										</span>
									</div>
									<div class="box3">
									</div>
									<span class="text13" >
										15.1 Сайд навигация. Меню
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										16. О нас. Меню
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										17. Вакансии
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										17.1 Вакансии. Описание и анкета кандидата
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										17.2 Вакансии. Заявка принята в обработку
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										18.Контакты
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										19. Реферальная программа
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										20. Франшиза для брокеров
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										20.1 Брокеры. Анкета для сотрудничества
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										20.2 Брокеры. Заявка принята в обработку
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										20А. Франшиза для риэлторов
									</span>
									<div class="box3">
									</div>
									<span class="text13" >
										20А.1 Риэлторы. Анкета для сотрудничества
									</span>
								</div>
								<div class="column">
									<div class="view2">
										<span class="text14" >
											Количество действии
										</span>
									</div>
									<div class="box4">
									</div>
									<span class="text15" >
										17
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										26
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										28
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										17
									</span>
									<div class="box4">
									</div>
									<span class="text18" >
										2
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										46
									</span>
									<div class="box4">
									</div>
									<span class="text19" >
										32
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										40
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										21
									</span>
									<div class="box4">
									</div>
									<span class="text18" >
										2
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										39
									</span>
									<div class="box4">
									</div>
									<span class="text16" >
										18
									</span>
								</div>
								<div class="column">
									<div class="view3">
										<span class="text14" >
											Были изменения
										</span>
									</div>
									<div class="box4">
									</div>
									<span class="text20" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text20" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
									<div class="box4">
									</div>
									<span class="text21" >
										01.08.2023 | 12:03
									</span>
								</div>
								<div class="column9">
									<div class="box5">
									</div>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/j59g4kle_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ixj4cedr_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/o0p36do1_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/6eulro3s_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/palzsy5f_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/r5fx6v9w_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/pzu5li5b_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/rw0w3mkr_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8c2diqwr_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/mv4dfzaf_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ec0f0i16_expires_30_days.png" 
										class="image8"
									/>
									<div class="box6">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hvqwpbem_expires_30_days.png" 
										class="image8"
									/>
								</div>
							</div>
							<div class="row-view9">
								<span class="text22" >
									Показывает 1-20 из 1000
								</span>
								<div class="row-view10">
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/qearq9bl_expires_30_days.png" 
										class="image9"
									/>
									<div class="view4">
										<span class="text23" >
											1
										</span>
									</div>
									<div class="view5">
										<span class="text24" >
											2
										</span>
									</div>
									<div class="view4">
										<span class="text23" >
											3
										</span>
									</div>
									<div class="view4">
										<span class="text23" >
											...
										</span>
									</div>
									<div class="view4">
										<span class="text23" >
											100
										</span>
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/j45ikffq_expires_30_days.png" 
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