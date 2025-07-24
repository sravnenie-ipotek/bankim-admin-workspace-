<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентсайта№3|РассчитатьИпотеку</title>
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
			width: 1px;
			height: 53px;
			background: #374151;
		}
		.box4 {
			height: 1px;
			align-self: stretch;
			background: #374151;
		}
		.box5 {
			width: 224px;
			height: 1px;
			background: #374151;
		}
		.box6 {
			width: 115px;
			height: 50px;
			background: #374151;
		}
		.box7 {
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
			align-self: stretch;
			display: flex;
			align-items: flex-start;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #00000012;
		}
		.row-view8 {
			display: flex;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 12px 89px 12px 16px;
			margin: 16px;
			gap: 10px;
		}
		.row-view9 {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
		}
		.row-view10 {
			align-self: stretch;
			display: flex;
			align-items: center;
			padding: 16px;
		}
		.row-view11 {
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
			color: #F9FAFB;
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
			margin-right: 56px;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 17px;
			margin-left: 56px;
		}
		.text6 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-bottom: 17px;
			margin-left: 56px;
			margin-right: 56px;
		}
		.text7 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-left: 56px;
		}
		.text8 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text9 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
			margin-right: 14px;
		}
		.text10 {
			color: #FFFFFF;
			font-size: 30px;
			font-weight: bold;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.text12 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text13 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
			margin-left: 12px;
			margin-right: 12px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 24px;
			font-weight: bold;
		}
		.text15 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text16 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
			margin-left: 16px;
		}
		.text17 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 16px 17px 16px;
		}
		.text18 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
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
			margin: 15px 194px 15px 16px;
			width: 14px;
		}
		.text21 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 202px 15px 16px;
			width: 6px;
		}
		.text22 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 195px 16px 16px;
		}
		.text23 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
		}
		.text24 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 93px 15px 16px;
			width: 115px;
		}
		.text25 {
			color: #9CA3AF;
			font-size: 14px;
			flex: 1;
		}
		.view {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			padding: 16px 62px 17px 62px;
		}
		.view2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #1F2A37;
			padding: 16px 60px 17px 60px;
		}
		.view3 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			padding: 16px 29px;
		}
		.view4 {
			flex: 1;
			display: flex;
			flex-direction: column;
			background: #1F2A37;
			padding: 16px;
			margin-right: 1px;
		}
		.view5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding-top: 16px;
			padding-bottom: 16px;
		}
		.view6 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 58px 16px 16px;
		}
		.view7 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 94px 16px 16px;
		}
		.view8 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
		.view9 {
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
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/803inttm_expires_30_days.png" 
					class="image"
				/>
				<div class="column2">
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/45aip0yk_expires_30_days.png" 
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
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/5g3tc2i3_expires_30_days.png" 
								class="image3"
							/>
							<span class="text2" >
								Контент сайта
							</span>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/fom8d2jh_expires_30_days.png" 
								class="image4"
							/>
						</button>
						<span class="text3" >
							Главная
						</span>
						<span class="text3" >
							Меню
						</span>
						<span class="text4" >
							Рассчитать ипотеку
						</span>
						<span class="text5" >
							Рефинансирование Ипотеки
						</span>
						<span class="text5" >
							Расчет Кредита
						</span>
						<span class="text6" >
							РефинансированиеКредита
						</span>
						<span class="text7" >
							Общие страницы
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/fqdib8jv_expires_30_days.png" 
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
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ixzc9taw_expires_30_days.png" 
						class="image2"
					/>
					<span class="text" >
						Настройки
					</span>
				</div>
				<div class="row-view3">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/tfpq8yje_expires_30_days.png" 
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
						<span class="text8" >
							Русский
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/73dxdji0_expires_30_days.png" 
							class="image2"
						/>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hsckjgfe_expires_30_days.png" 
						class="image5"
					/>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/0wmqhh7m_expires_30_days.png" 
						class="image5"
					/>
					<div class="row-view6">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8k4jinhr_expires_30_days.png" 
							class="image6"
						/>
						<span class="text9" >
							Александр пушкин
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ys6lbuh0_expires_30_days.png" 
							class="image2"
						/>
					</div>
				</div>
				<div class="column5">
					<span class="text10" >
						Рассчитать ипотеку
					</span>
					<div class="row-view7">
						<div class="view">
							<span class="text11" >
								До регистрации
							</span>
						</div>
						<div class="box3">
						</div>
						<div class="view2">
							<span class="text12" >
								Личный кабинет
							</span>
						</div>
						<div class="box3">
						</div>
						<div class="view3">
							<span class="text12" >
								Админ панель для сайтов
							</span>
						</div>
						<div class="box3">
						</div>
						<div class="view4">
							<span class="text13" >
								Админ панель для банков
							</span>
						</div>
						<div class="box3">
						</div>
					</div>
					<div class="column6">
						<span class="text14" >
							Список страниц
						</span>
						<div class="column7">
							<div class="row-view8">
								<img
									src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lpl56tj2_expires_30_days.png" 
									class="image7"
								/>
								<span class="text15" >
									Искать по названию, ID, номеру страницы
								</span>
							</div>
							<div class="row-view9">
								<div class="column8">
									<div class="view5">
										<span class="text16" >
											НАЗВАНИЕ СТРАНИЦЫ
										</span>
									</div>
									<div class="box4">
									</div>
									<span class="text17" >
										2.Калькулятор ипотеки.
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										4.Анкета личных данных
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										7.Анкета доходов. Наемный работник
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										7.1 Добавление источника дохода
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										7.2 Добавление доп источника дохода
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										7.3 Добавление долгового обязательства
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										11. Выбор программ ипотеки
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										11.1 Детали банка. Описание
									</span>
									<div class="box4">
									</div>
									<span class="text17" >
										11.2 Детали банка. Условия
									</span>
								</div>
								<div class="column">
									<div class="view6">
										<span class="text18" >
											Количество действии
										</span>
									</div>
									<div class="box5">
									</div>
									<span class="text19" >
										15
									</span>
									<div class="box5">
									</div>
									<span class="text20" >
										23
									</span>
									<div class="box5">
									</div>
									<span class="text20" >
										22
									</span>
									<div class="box5">
									</div>
									<span class="text21" >
										9
									</span>
									<div class="box5">
									</div>
									<span class="text21" >
										5
									</span>
									<div class="box5">
									</div>
									<span class="text21" >
										7
									</span>
									<div class="box5">
									</div>
									<span class="text22" >
										11
									</span>
									<div class="box5">
									</div>
									<span class="text21" >
										3
									</span>
									<div class="box5">
									</div>
									<span class="text21" >
										3
									</span>
								</div>
								<div class="column">
									<div class="view7">
										<span class="text18" >
											Были изменения
										</span>
									</div>
									<div class="box5">
									</div>
									<span class="text23" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text23" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
									<div class="box5">
									</div>
									<span class="text24" >
										01.08.2023 | 12:03
									</span>
								</div>
								<div class="column9">
									<div class="box6">
									</div>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hh3pg2ms_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/wdrityv6_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7cf16bc4_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/38rgevot_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/aykslh2m_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/u9i3xvp6_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/0putl79z_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/gfaw6sxe_expires_30_days.png" 
										class="image8"
									/>
									<div class="box7">
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/izzhzcig_expires_30_days.png" 
										class="image8"
									/>
								</div>
							</div>
							<div class="row-view10">
								<span class="text25" >
									Показывает 1-20 из 1000
								</span>
								<div class="row-view11">
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ecf34qxu_expires_30_days.png" 
										class="image9"
									/>
									<div class="view8">
										<span class="text12" >
											1
										</span>
									</div>
									<div class="view9">
										<span class="text11" >
											2
										</span>
									</div>
									<div class="view8">
										<span class="text12" >
											3
										</span>
									</div>
									<div class="view8">
										<span class="text12" >
											...
										</span>
									</div>
									<div class="view8">
										<span class="text12" >
											100
										</span>
									</div>
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/p8fvcvs3_expires_30_days.png" 
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