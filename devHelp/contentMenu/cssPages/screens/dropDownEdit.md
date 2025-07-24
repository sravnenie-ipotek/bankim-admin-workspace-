<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентстраницы№13.1Dropdown|Default|RU</title>
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
			padding-bottom: 749px;
		}
		.column3 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 32px;
			margin-left: 370px;
			margin-right: 145px;
			gap: 16px;
		}
		.column4 {
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
		.column5 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 370px;
			gap: 8px;
		}
		.column6 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 37px;
			margin-left: 688px;
			margin-right: 463px;
			gap: 8px;
		}
		.column7 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.column8 {
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
			margin-bottom: 24px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view3 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			margin-right: 20px;
			gap: 12px;
		}
		.row-view4 {
			display: flex;
			align-items: center;
			margin-bottom: 23px;
			margin-left: 20px;
			margin-right: 20px;
		}
		.row-view5 {
			display: flex;
			align-items: flex-start;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view6 {
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
		.row-view7 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view8 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.row-view9 {
			display: flex;
			align-items: center;
			border-radius: 6px;
			gap: 16px;
		}
		.row-view10 {
			align-self: stretch;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view11 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-bottom: 24px;
			margin-left: 370px;
			gap: 48px;
		}
		.row-view12 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			padding-right: 2px;
			gap: 22px;
		}
		.row-view13 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 20px;
		}
		.row-view14 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 16px;
		}
		.row-view15 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-bottom: 24px;
			margin-left: 370px;
		}
		.row-view16 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			margin-right: 48px;
			gap: 20px;
		}
		.row-view17 {
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
			padding: 24px 145px 24px 564px;
			margin-bottom: 5px;
			margin-left: 264px;
			gap: 16px;
		}
		.row-view18 {
			display: flex;
			align-items: center;
			padding-left: 42px;
			padding-right: 42px;
			margin-left: 370px;
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
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text6 {
			color: #F9FAFB;
			font-size: 30px;
			font-weight: bold;
		}
		.text7 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text8 {
			color: #F9FAFB;
			font-size: 18px;
			font-weight: bold;
		}
		.text9 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 16px;
			margin-left: 370px;
		}
		.text10 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
		}
		.text12 {
			color: #FFFFFF;
			font-size: 14px;
			text-align: right;
		}
		.text13 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 40px;
			margin-left: 370px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-right: 50px;
		}
		.text15 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-left: 458px;
		}
		.text16 {
			color: #111928;
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
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-bottom: 1px;
		}
		.view3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 106px 9px 16px;
		}
		.view4 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
		}
		.view6 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view7 {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view8 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view9 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view10 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
			margin-left: 515px;
		}
		.view11 {
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
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/th13xosp_expires_30_days.png" 
						class="image"
					/>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/3o3v8pir_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Главная
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/6aszq6hw_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Пользователи
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/vc1pmj6x_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Клиенты
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lgtex3kv_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Предложения
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/d6gli0zv_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							История Действий
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7un4xw9x_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Банковские программы
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/o19ca1xf_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Создание аудитории
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/sumthd6g_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Формула калькулятора
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/mioex448_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Чат
						</span>
					</div>
					<div class="row-view4">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ksqnjesh_expires_30_days.png" 
							class="image3"
						/>
						<span class="text3" >
							Контент сайта
						</span>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/byzffgdd_expires_30_days.png" 
							class="image4"
						/>
					</div>
					<div class="box">
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lhb609gb_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Настройки
						</span>
					</div>
					<div class="row-view5">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/fy56vmdm_expires_30_days.png" 
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
			<div class="row-view6">
				<div class="row-view7">
					<span class="text4" >
						Русский
					</span>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/pwf0qcvr_expires_30_days.png" 
						class="image2"
					/>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/c1w19w2y_expires_30_days.png" 
					class="image5"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/egjvtrai_expires_30_days.png" 
					class="image5"
				/>
				<div class="row-view8">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ilsjcyg1_expires_30_days.png" 
						class="image6"
					/>
					<div class="view">
						<span class="text4" >
							Александр пушкин
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/bsj1mcos_expires_30_days.png" 
						class="image2"
					/>
				</div>
			</div>
			<div class="column3">
				<div class="row-view9">
					<div class="view2">
						<span class="text5" >
							Контент сайта
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/03ra3h9a_expires_30_days.png" 
						class="image7"
					/>
					<div class="view2">
						<span class="text5" >
							Главная страница Страница  №1
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/s47dly3q_expires_30_days.png" 
						class="image7"
					/>
					<div class="view2">
						<span class="text5" >
							Действие №3
						</span>
					</div>
				</div>
				<div class="row-view10">
					<span class="text6" >
						Номер дейcтвия №3 | Основной источник дохода
					</span>
					<div class="view2">
						<span class="text7" >
							Home_page
						</span>
					</div>
				</div>
			</div>
			<div class="column4">
				<span class="text7" >
					Последнее редактирование
				</span>
				<span class="text8" >
					01.08.2023 | 12:03
				</span>
			</div>
			<span class="text9" >
				Заголовки действий
			</span>
			<div class="column5">
				<span class="text10" >
					RU
				</span>
				<div class="view3">
					<span class="text11" >
						Основой источник дохода
					</span>
				</div>
			</div>
			<div class="column6">
				<span class="text10" >
					HEB
				</span>
				<div class="view4">
					<span class="text12" >
						מקור הכנסה עיקרי
					</span>
				</div>
			</div>
			<div class="view5">
				<button class="button-row-view"
					onclick="alert('Pressed!')"}>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/unq48gri_expires_30_days.png" 
						class="image8"
					/>
					<span class="text4" >
						Добавить вариант
					</span>
				</button>
			</div>
			<span class="text13" >
				Опции ответов
			</span>
			<div class="row-view11">
				<div class="row-view12">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/47nm1mxb_expires_30_days.png" 
						class="image2"
					/>
					<span class="text2" >
						1
					</span>
				</div>
				<div class="row-view13">
					<div class="column7">
						<span class="text10" >
							RU
						</span>
						<div class="view6">
							<span class="text11" >
								Cотрудник
							</span>
						</div>
					</div>
					<div class="column8">
						<span class="text10" >
							HEB
						</span>
						<div class="view7">
							<span class="text11" >
								עוֹבֵד
							</span>
						</div>
					</div>
				</div>
				<div class="row-view14">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/9czd2q6x_expires_30_days.png" 
						class="image6"
					/>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/q5nykoy5_expires_30_days.png" 
						class="image6"
					/>
				</div>
			</div>
			<div class="row-view15">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hkqulsju_expires_30_days.png" 
					class="image9"
				/>
				<span class="text14" >
					2
				</span>
				<div class="row-view16">
					<div class="view8">
						<span class="text11" >
							Cотрудник
						</span>
					</div>
					<div class="view9">
						<span class="text11" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/xbvq1f2i_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/uk4gmltl_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="view10">
				<span class="text11" >
					Cотрудник
				</span>
			</div>
			<div class="view11">
				<span class="text12" >
					עוֹבֵד
				</span>
			</div>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/v4nwp0wp_expires_30_days.png" 
				class="image11"
			/>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/x69b80pt_expires_30_days.png" 
				class="image12"
			/>
			<img
				src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/tage4x1v_expires_30_days.png" 
				class="image13"
			/>
			<span class="text15" >
				3
			</span>
			<div class="row-view17">
				<button class="button"
					onclick="alert('Pressed!')"}>
					<span class="text4" >
						Назад
					</span>
				</button>
				<button class="button2"
					onclick="alert('Pressed!')"}>
					<span class="text16" >
						Сохранить и опубликовать
					</span>
				</button>
			</div>
			<div class="row-view15">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/avlkddiz_expires_30_days.png" 
					class="image9"
				/>
				<span class="text14" >
					5
				</span>
				<div class="row-view16">
					<div class="view8">
						<span class="text11" >
							Cотрудник
						</span>
					</div>
					<div class="view9">
						<span class="text11" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/5pxal1by_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/dz747vgd_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view15">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/0eaq06tl_expires_30_days.png" 
					class="image9"
				/>
				<span class="text14" >
					6
				</span>
				<div class="row-view16">
					<div class="view8">
						<span class="text11" >
							Cотрудник
						</span>
					</div>
					<div class="view9">
						<span class="text11" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/62di3lg3_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/s7bxuth5_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view15">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/y51jq07j_expires_30_days.png" 
					class="image9"
				/>
				<span class="text14" >
					7
				</span>
				<div class="row-view16">
					<div class="view8">
						<span class="text11" >
							Cотрудник
						</span>
					</div>
					<div class="view9">
						<span class="text11" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/kbsyit5w_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ahg0ixb1_expires_30_days.png" 
					class="image6"
				/>
			</div>
			<div class="row-view18">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/4pk73esj_expires_30_days.png" 
					class="image9"
				/>
				<span class="text14" >
					8
				</span>
				<div class="row-view16">
					<div class="view8">
						<span class="text11" >
							Cотрудник
						</span>
					</div>
					<div class="view9">
						<span class="text11" >
							עוֹבֵד
						</span>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1uem84qa_expires_30_days.png" 
					class="image10"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/pybchxll_expires_30_days.png" 
					class="image6"
				/>
			</div>
		</div>
	</div>
</body>
</html>