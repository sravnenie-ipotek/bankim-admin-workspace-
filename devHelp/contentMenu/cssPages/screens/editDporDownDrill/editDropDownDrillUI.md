<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентстраницы№4.1Dropdown|Default|RU</title>
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
			height: 1419px;
			background: #374151;
		}
		.button {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: none;
			border-radius: 8px;
			border: 1px solid #9CA3AF;
			padding: 10px 92px;
			text-align: left;
		}
		.button2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #FBE54D;
			border-radius: 8px;
			border: none;
			padding: 10px 23px;
			text-align: left;
		}
		.button-row-view {
			display: flex;
			align-items: flex-start;
			background: #374151;
			border-radius: 4px;
			border: none;
			padding: 8px;
			margin-left: 8px;
			margin-right: 8px;
			text-align: left;
		}
		.button-row-view2 {
			display: flex;
			align-items: center;
			background: none;
			border-radius: 8px;
			border: 1px solid #9CA3AF;
			padding: 8px 12px;
			margin-right: 145px;
			gap: 8px;
			text-align: left;
		}
		.column {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #111928;
			padding-bottom: 311px;
		}
		.column2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding-bottom: 818px;
		}
		.column3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 12px;
			margin-right: 12px;
			gap: 12px;
		}
		.column4 {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			margin-left: 8px;
			margin-right: 8px;
			gap: 16px;
		}
		.column5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 32px;
			margin-left: 370px;
			margin-right: 145px;
			gap: 16px;
		}
		.column6 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			padding: 24px 89px 24px 24px;
			margin-bottom: 32px;
			margin-left: 370px;
			gap: 12px;
		}
		.column7 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 370px;
			gap: 8px;
		}
		.column8 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 37px;
			margin-left: 688px;
			margin-right: 463px;
			gap: 8px;
		}
		.column9 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.column10 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;
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
			object-fit: fill;
		}
		.image7 {
			border-radius: 6px;
			width: 20px;
			height: 20px;
			object-fit: fill;
		}
		.image8 {
			border-radius: 8px;
			width: 16px;
			height: 16px;
			object-fit: fill;
		}
		.image9 {
			width: 24px;
			height: 24px;
			margin-right: 22px;
			object-fit: fill;
		}
		.image10 {
			width: 32px;
			height: 32px;
			margin-right: 16px;
			object-fit: fill;
		}
		.image11 {
			width: 32px;
			height: 32px;
			margin-left: 1173px;
			object-fit: fill;
		}
		.image12 {
			width: 32px;
			height: 32px;
			margin-left: 1221px;
			object-fit: fill;
		}
		.image13 {
			width: 24px;
			height: 24px;
			margin-left: 412px;
			object-fit: fill;
		}
		.row-view {
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
		}
		.row-view2 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 23px;
			margin-left: 20px;
			gap: 12px;
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
			margin-left: 20px;
			gap: 12px;
		}
		.row-view5 {
			align-self: stretch;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			background: #1F2A37;
			padding: 24px 40px 24px 667px;
			margin-bottom: 51px;
			margin-left: 265px;
			gap: 32px;
			box-shadow: 0px 2px 4px #0000000D;
		}
		.row-view6 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view7 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.row-view8 {
			display: flex;
			align-items: center;
			border-radius: 6px;
			gap: 16px;
		}
		.row-view9 {
			align-self: stretch;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view10 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-bottom: 24px;
			margin-left: 370px;
			gap: 48px;
		}
		.row-view11 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			padding-right: 2px;
			gap: 22px;
		}
		.row-view12 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 20px;
		}
		.row-view13 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 16px;
		}
		.row-view14 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-bottom: 24px;
			margin-left: 370px;
		}
		.row-view15 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			margin-right: 48px;
			gap: 20px;
		}
		.row-view16 {
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
			padding: 24px 145px 24px 564px;
			margin-bottom: 5px;
			margin-left: 264px;
			gap: 16px;
		}
		.row-view17 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-left: 370px;
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
			color: #FBE54D;
			font-size: 14px;
			font-weight: bold;
			margin-right: 124px;
		}
		.text4 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-right: 140px;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-right: 44px;
		}
		.text6 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.text7 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-right: 75px;
		}
		.text8 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-right: 51px;
		}
		.text9 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin-right: 64px;
		}
		.text10 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text11 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text12 {
			color: #F9FAFB;
			font-size: 30px;
			font-weight: bold;
		}
		.text13 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text14 {
			color: #F9FAFB;
			font-size: 18px;
			font-weight: bold;
		}
		.text15 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 16px;
			margin-left: 370px;
		}
		.text16 {
			color: #FFFFFF;
			font-size: 14px;
		}
		.text17 {
			color: #FFFFFF;
			font-size: 14px;
			text-align: right;
		}
		.text18 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 40px;
			margin-left: 370px;
		}
		.text19 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-right: 50px;
		}
		.text20 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-left: 458px;
		}
		.text21 {
			color: #111928;
			font-size: 14px;
			font-weight: bold;
		}
		.view {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.view2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.view3 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-bottom: 1px;
		}
		.view4 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 106px 9px 16px;
		}
		.view5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view6 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
		}
		.view7 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view8 {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view9 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view10 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view11 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
			margin-left: 515px;
		}
		.view12 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
			margin-left: 830px;
			margin-right: 315px;
		}
	</style>
</head>
<body>
		<div class="contain">
		<div class="column">
			<div class="row-view">
				<div class="column2">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/5py2uwyk_expires_30_days.png" 
						class="image"
					/>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/z9dts80p_expires_30_days.png" 
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
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/nclqnerb_expires_30_days.png" 
								class="image3"
							/>
							<span class="text2" >
								Контент сайта
							</span>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/6s066xig_expires_30_days.png" 
								class="image4"
							/>
						</button>
						<div class="column4">
							<span class="text3" >
								Главная
							</span>
							<span class="text4" >
								Меню
							</span>
							<span class="text5" >
								Рассчитать ипотеку
							</span>
							<div class="view">
								<span class="text6" >
									Рефинансирование Ипотеки
								</span>
							</div>
							<span class="text7" >
								Расчет Кредита
							</span>
							<span class="text8" >
								РефинансированиеКредита
							</span>
							<span class="text9" >
								Общие страницы
							</span>
						</div>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/2k2fztv1_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Чат
						</span>
					</div>
					<div class="box">
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7v1web1p_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Настройки
						</span>
					</div>
					<div class="row-view4">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/djkj63ec_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Выйти
						</span>
					</div>
				</div>
				<div class="box2">
				</div>
			</div>
			<div class="row-view5">
				<div class="row-view6">
					<span class="text10" >
						Русский
					</span>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7jhk995g_expires_30_days.png" 
						class="image2"
					/>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/g9mikl5r_expires_30_days.png" 
					class="image5"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/2tnk05zy_expires_30_days.png" 
					class="image5"
				/>
				<div class="row-view7">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ln8xtcet_expires_30_days.png" 
						class="image6"
					/>
					<div class="view2">
						<span class="text10" >
							Александр пушкин
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/cttf5yfy_expires_30_days.png" 
						class="image2"
					/>
				</div>
			</div>
			<div class="column5">
				<div class="row-view8">
					<div class="view3">
						<span class="text11" >
							Контент сайта
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/mqph4bs2_expires_30_days.png" 
						class="image7"
					/>
					<div class="view3">
						<span class="text11" >
							Главная страница Страница  №1
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/la9772ch_expires_30_days.png" 
						class="image7"
					/>
					<div class="view3">
						<span class="text11" >
							Действие №3
						</span>
					</div>
				</div>
				<div class="row-view9">
					<span class="text12" >
						Номер дейcтвия №3 | Основной источник дохода
					</span>
					<div class="view3">
						<span class="text13" >
							Home_page
						</span>
					</div>
				</div>
			</div>
			<div class="column6">
				<span class="text13" >
					Последнее редактирование
				</span>
				<span class="text14" >
					01.08.2023 | 12:03
				</span>
			</div>
			<span class="text15" >
				Заголовки действий
			</span>
			<div class="column7">
				<span class="text6" >
					RU
				</span>
				<div class="view4">
					<span class="text16" >
						Основой источник дохода
					</span>
				</div>
			</div>
			<div class="column8">
				<span class="text6" >
					HEB
				</span>
				<div class="view5">
					<span class="text17" >
						מקור הכנסה עיקרי
					</span>
				</div>
			</div>
			<div class="view6">
				<button class="button-row-view2"
					onclick="alert('Pressed!')"}>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/n7hopjf5_expires_30_days.png" 
						class="image8"
					/>
					<span class="text10" >
						Добавить вариант
					</span>
				</button>
			</div>
			<span class="text18" >
				Опции ответов
			</span>
			<div class="row-view10">
				<div class="row-view11">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/kciznreh_expires_30_days.png" 
						class="image2"
					/>
					<span class="text" >
						1
					</span>
				</div>
				<div class="row-view12">
					<div class="column9">
						<span class="text6" >
							RU
						</span>
						<div class="view7">
							<span class="text16" >
								Cотрудник
							</span>
						</div>
					</div>
					<div class="column10">
						<span class="text6" >
							HEB
						</span>
						<div class="view8">
							<span class="text16" >
								עוֹבֵד
							</span>
						</div>
					</div>
				</div>
				<div class="row-view13">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/999umiqg_expires_30_days.png" 
						class="image6"
					/>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1co2c50d_expires_30_days.png" 
						class="image6"
					/>
				</div>
			</div>
			<div class="row-view14">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lv7mg2c2_expires_30_days.png" 
					class="image9"
				/>
				<span class="text19" >
					2
				</span>
				<div class="row-view15">
					<div class="view9">
						<span class="text16" >
							Cотрудник
						</span>
					</div>
					<div class="view10">
						<span class="text16" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/xpan2bp9_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/q97ddiyw_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="view11">
				<span class="text16" >
					Cотрудник
				</span>
			</div>
			<div class="view12">
				<span class="text17" >
					עוֹבֵד
				</span>
			</div>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/egr1yggy_expires_30_days.png" 
				class="image11"
			/>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/a7q56xax_expires_30_days.png" 
				class="image12"
			/>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/bjies1cf_expires_30_days.png" 
				class="image13"
			/>
			<span class="text20" >
				3
			</span>
			<div class="row-view16">
				<button class="button"
					onclick="alert('Pressed!')"}>
					<span class="text10" >
						Назад
					</span>
				</button>
				<button class="button2"
					onclick="alert('Pressed!')"}>
					<span class="text21" >
						Сохранить и опубликовать
					</span>
				</button>
			</div>
			<div class="row-view14">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/e6vkecxq_expires_30_days.png" 
					class="image9"
				/>
				<span class="text19" >
					5
				</span>
				<div class="row-view15">
					<div class="view9">
						<span class="text16" >
							Cотрудник
						</span>
					</div>
					<div class="view10">
						<span class="text16" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1akpyp58_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/93ljjwia_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view14">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/aajar935_expires_30_days.png" 
					class="image9"
				/>
				<span class="text19" >
					6
				</span>
				<div class="row-view15">
					<div class="view9">
						<span class="text16" >
							Cотрудник
						</span>
					</div>
					<div class="view10">
						<span class="text16" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/o1t8w7t2_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/smr2ph09_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view14">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/snduoiny_expires_30_days.png" 
					class="image9"
				/>
				<span class="text19" >
					7
				</span>
				<div class="row-view15">
					<div class="view9">
						<span class="text16" >
							Cотрудник
						</span>
					</div>
					<div class="view10">
						<span class="text16" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/q7l2bqje_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lezek2cg_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view17">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ojlzgnac_expires_30_days.png" 
					class="image9"
				/>
				<span class="text19" >
					8
				</span>
				<div class="row-view15">
					<div class="view9">
						<span class="text16" >
							Cотрудник
						</span>
					</div>
					<div class="view10">
						<span class="text16" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8k5wmpqu_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/cystt9tc_expires_30_days.png" 
					class="image6"
				/>
			</div>
		</div>
	</div>
</body>
</html>